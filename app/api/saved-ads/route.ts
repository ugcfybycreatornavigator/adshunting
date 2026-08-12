import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env/server";
import { dbAdToNormalized, normalizedToDb, type DatabaseAdRow } from "@/lib/catalog";
import { isTrustedAdMediaUrl, safeExternalUrl } from "@/lib/utils";

const adSchema = z.object({
  externalAdId: z.string().min(1).max(200), advertiserId: z.string().min(1).max(200), advertiserName: z.string().min(1).max(300),
  advertiserAvatarUrl: z.string().nullable(), advertiserProfileUrl: z.string().nullable(), body: z.string().nullable(), headline: z.string().nullable(),
  caption: z.string().nullable(), description: z.string().nullable(), hashtags: z.array(z.string().max(100)).max(30), cta: z.string().nullable(), landingPageUrl: z.string().nullable(), sourceMediaUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(), carouselAssets: z.array(z.string()).max(20), storedMediaPath: z.string().nullable(), archiveStatus: z.enum(["not_requested","archived","failed","unavailable"]), mediaType: z.enum(["image","video","carousel","unknown"]),
  status: z.enum(["active","inactive","unknown"]), startDate: z.string().nullable(), stopDate: z.string().nullable(), firstSeenAt: z.string(), lastSeenAt: z.string(),
  runningDays: z.number().nullable(), country: z.string().nullable(), platforms: z.array(z.string()).max(8), demographics: z.record(z.record(z.number())).nullable(), snapshotUrl: z.string().nullable(),
  source: z.enum(["searchapi","meta","foreplay","catalog"]), variants: z.number(), creativeRepetition: z.number(), brandActiveAds: z.number().nullable(), winnerScore: z.number(),
  intelligenceLabels: z.array(z.string()), rawData: z.record(z.unknown()).optional(), id: z.string(),
});

export async function GET(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const params = new URL(request.url).searchParams;
  const collectionId = params.get("collectionId");
  const selection = collectionId ? "id, notes, created_at, ads(*), saved_ad_tags(tags(id,name)), collection_ads!inner(collection_id)" : "id, notes, created_at, ads(*), saved_ad_tags(tags(id,name)), collection_ads(collection_id)";
  let query = auth.supabase!.from("saved_ads").select(selection).eq("user_id", auth.user!.id).order("created_at", { ascending: false }).limit(60);
  if (collectionId) query = query.eq("collection_ads.collection_id", collectionId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  type TagRow = { id: string; name: string };
  type SavedAdRow = {
    id: string;
    notes: string | null;
    created_at: string;
    ads: DatabaseAdRow | DatabaseAdRow[];
    saved_ad_tags?: { tags: TagRow | TagRow[] | null }[];
    collection_ads?: { collection_id: string }[];
  };
  const savedRows = (data ?? []) as unknown as SavedAdRow[];
  const rows = await Promise.all(savedRows.map(async (row) => {
    const ad = dbAdToNormalized(Array.isArray(row.ads) ? row.ads[0] : row.ads);
    if (ad.storedMediaPath && getServerEnv().serviceRoleKey) {
      const { data: signed } = await createAdminClient().storage.from("ad-creatives").createSignedUrl(ad.storedMediaPath, 3600);
      if (signed?.signedUrl) ad.sourceMediaUrl = signed.signedUrl;
    }
    return { id: row.id, notes: row.notes, createdAt: row.created_at, ad, tags: (row.saved_ad_tags ?? []).flatMap((link) => link.tags ? [Array.isArray(link.tags) ? link.tags[0] : link.tags] : []), collectionIds: (row.collection_ads ?? []).map((link) => link.collection_id) };
  }));
  return NextResponse.json({ savedAds: rows });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const parsed = z.object({ ad: adSchema, collectionIds: z.array(z.string().uuid()).max(20).default([]), notes: z.string().max(5000).optional() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "The ad payload is invalid." }, { status: 400 });
  try {
    const admin = createAdminClient();
    const dbAd = normalizedToDb(parsed.data.ad);
    const { data: adRow, error: adError } = await admin.from("ads").upsert(dbAd, { onConflict: "external_ad_id" }).select().single();
    if (adError) throw adError;
    let storedMediaPath = adRow.stored_media_path as string | null;
    let archiveStatus = storedMediaPath ? "archived" : (adRow.archive_status as string || "not_requested");
    if (!storedMediaPath && archiveStatus === "not_requested" && getServerEnv().allowMediaArchival && parsed.data.ad.sourceMediaUrl) {
      storedMediaPath = await archiveMedia(admin, parsed.data.ad);
      archiveStatus = storedMediaPath ? "archived" : "failed";
      if (storedMediaPath) {
        const { error: mediaUpdateError } = await admin.from("ads").update({ stored_media_path: storedMediaPath, archive_status: archiveStatus }).eq("id", adRow.id);
        if (mediaUpdateError) throw mediaUpdateError;
      } else {
        await admin.from("ads").update({ archive_status: archiveStatus }).eq("id", adRow.id);
      }
    } else if (!storedMediaPath && archiveStatus === "not_requested" && getServerEnv().allowMediaArchival) {
      archiveStatus = "unavailable";
      await admin.from("ads").update({ archive_status: archiveStatus }).eq("id", adRow.id);
    }
    const { data: saved, error: savedError } = await auth.supabase!.from("saved_ads").upsert({ user_id: auth.user!.id, ad_id: adRow.id, notes: parsed.data.notes }, { onConflict: "user_id,ad_id" }).select().single();
    if (savedError) throw savedError;
    if (parsed.data.collectionIds.length) {
      const { data: owned } = await auth.supabase!.from("collections").select("id").eq("user_id", auth.user!.id).in("id", parsed.data.collectionIds);
      const rows = (owned ?? []).map((collection) => ({ collection_id: collection.id, saved_ad_id: saved.id }));
      if (rows.length) {
        const { error } = await auth.supabase!.from("collection_ads").upsert(rows, { onConflict: "collection_id,saved_ad_id" });
        if (error) throw error;
      }
    }
    return NextResponse.json({ savedAdId: saved.id, mediaArchived: Boolean(storedMediaPath), archiveStatus }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save this ad." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const parsed = z.object({ id: z.string().uuid(), notes: z.string().max(5000).optional(), collectionIds: z.array(z.string().uuid()).max(20).optional() })
    .refine((value) => value.notes !== undefined || value.collectionIds !== undefined)
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid saved-ad update." }, { status: 400 });
  const { data: savedAd, error: ownershipError } = await auth.supabase!.from("saved_ads").select("id").eq("id", parsed.data.id).eq("user_id", auth.user!.id).maybeSingle();
  if (ownershipError) return NextResponse.json({ error: ownershipError.message }, { status: 400 });
  if (!savedAd) return NextResponse.json({ error: "Saved ad not found." }, { status: 404 });
  if (parsed.data.notes !== undefined) {
    const { error } = await auth.supabase!.from("saved_ads").update({ notes: parsed.data.notes }).eq("id", parsed.data.id).eq("user_id", auth.user!.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (parsed.data.collectionIds !== undefined) {
    const uniqueIds = [...new Set(parsed.data.collectionIds)];
    const { data: owned, error: collectionError } = uniqueIds.length
      ? await auth.supabase!.from("collections").select("id").eq("user_id", auth.user!.id).in("id", uniqueIds)
      : { data: [], error: null };
    if (collectionError) return NextResponse.json({ error: collectionError.message }, { status: 400 });
    if ((owned ?? []).length !== uniqueIds.length) return NextResponse.json({ error: "One or more swipe files were not found." }, { status: 400 });
    const { error: removeError } = await auth.supabase!.from("collection_ads").delete().eq("saved_ad_id", parsed.data.id);
    if (removeError) return NextResponse.json({ error: removeError.message }, { status: 400 });
    if (uniqueIds.length) {
      const { error: addError } = await auth.supabase!.from("collection_ads").insert(uniqueIds.map((collectionId) => ({ collection_id: collectionId, saved_ad_id: parsed.data.id })));
      if (addError) return NextResponse.json({ error: addError.message }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Saved ad id is required." }, { status: 400 });
  const { error } = await auth.supabase!.from("saved_ads").delete().eq("id", id).eq("user_id", auth.user!.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}

async function archiveMedia(admin: ReturnType<typeof createAdminClient>, ad: z.infer<typeof adSchema>) {
  try {
    const url = safeExternalUrl(ad.sourceMediaUrl); if (!url) return null;
    if (!isTrustedAdMediaUrl(url)) return null;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
    if (!response.ok) return null;
    if (!isTrustedAdMediaUrl(response.url)) return null;
    const type = response.headers.get("content-type")?.split(";")[0] || "";
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm"];
    if (!allowed.includes(type)) return null;
    const declared = Number(response.headers.get("content-length") || 0); if (declared > 40 * 1024 * 1024) return null;
    const data = await response.arrayBuffer(); if (data.byteLength > 40 * 1024 * 1024) return null;
    const ext: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif", "video/mp4":"mp4", "video/webm":"webm" };
    const path = `ads/${ad.advertiserId}/${ad.externalAdId}/creative.${ext[type]}`;
    const { error } = await admin.storage.from("ad-creatives").upload(path, data, { contentType: type, upsert: false });
    if (error && !error.message.toLowerCase().includes("already exists")) return null;
    return path;
  } catch {
    return null;
  }
}
