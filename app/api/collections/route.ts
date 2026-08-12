import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

type CollectionRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  collection_ads?: { count: number }[];
};

export async function GET() {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const { data, error } = await auth.supabase!.from("collections").select("*, collection_ads(count)").eq("user_id", auth.user!.id).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as CollectionRow[];
  return NextResponse.json({ collections: rows.map((row) => ({ id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at, adCount: row.collection_ads?.[0]?.count ?? 0 })) });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const parsed = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).optional() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a folder name up to 80 characters." }, { status: 400 });
  const { data, error } = await auth.supabase!.from("collections").insert({ ...parsed.data, user_id: auth.user!.id }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "A folder with that name already exists." : error.message }, { status: 400 });
  return NextResponse.json({ collection: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const parsed = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).nullable().optional() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid folder update." }, { status: 400 });
  const { id, ...changes } = parsed.data;
  const { error } = await auth.supabase!.from("collections").update(changes).eq("id", id).eq("user_id", auth.user!.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(); if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Folder id is required." }, { status: 400 });
  const { error } = await auth.supabase!.from("collections").delete().eq("id", id).eq("user_id", auth.user!.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
