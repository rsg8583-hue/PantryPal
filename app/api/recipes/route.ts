import { NextResponse } from "next/server";
import { recipes } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ recipes });
}

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    recipe: {
      id: `recipe-${Date.now()}`,
      ...body,
    },
  });
}
