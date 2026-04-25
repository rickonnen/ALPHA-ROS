// app/api/home/banner/route.ts

import { supabaseHome } from "@/lib/supabaseHome";
import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
  const { data, error } = await supabaseHome
    .from("banner_images")
    .select("*")
    .eq("is_active", true)
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener las imágenes del banner" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}