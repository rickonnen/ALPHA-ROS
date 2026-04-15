import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return NextResponse.redirect(`${baseUrl}/`, { status: 302 })
}