import { NextResponse } from "next/server";
import { getGenres } from "@/lib/model-data";

export async function GET() {
  return NextResponse.json({ genres: getGenres() });
}
