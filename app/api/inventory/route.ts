import { NextResponse } from "next/server";
import { pantryItems } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ items: pantryItems });
}

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    item: {
      id: `temp-${Date.now()}`,
      ...body,
    },
  });
}
