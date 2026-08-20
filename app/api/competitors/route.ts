import { requirePaidWorkspaceAccess } from "@/lib/billing/entitlement";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const accessError = await requirePaidWorkspaceAccess(); if (accessError) return accessError;
  const { data, error } = await auth.supabase!.from("competitors").select("*").eq("user_id", auth.user!.id).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ competitors: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const accessError = await requirePaidWorkspaceAccess(); if (accessError) return accessError;
  const parsed = z.object({ advertiserId: z.string().min(1).max(200), advertiserName: z.string().min(1).max(300), advertiserAvatarUrl: z.string().nullable().optional() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid advertiser." }, { status: 400 });
  const { data, error } = await auth.supabase!.from("competitors").upsert({ user_id: auth.user!.id, advertiser_id: parsed.data.advertiserId, advertiser_name: parsed.data.advertiserName, advertiser_avatar_url: parsed.data.advertiserAvatarUrl }, { onConflict: "user_id,advertiser_id" }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ competitor: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const accessError = await requirePaidWorkspaceAccess(); if (accessError) return accessError;
  const id = new URL(request.url).searchParams.get("id");
  const { error } = await auth.supabase!.from("competitors").delete().eq("id", id).eq("user_id", auth.user!.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
