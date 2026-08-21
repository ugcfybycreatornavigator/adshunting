import { NextResponse } from "next/server";
import { getBrands } from "@/lib/brand-data";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireUser();

    const { query } = await request.json();
    const brands = await getBrands(query);

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Brands search error:", error);
    return NextResponse.json(
      { error: "Failed to search brands" },
      { status: 500 }
    );
  }
}
