import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // only handle homepage
  if (url.pathname !== "/") return NextResponse.next();

  const tier = (await get("activeTier")) as string | undefined;

  const target =
    tier === "early" ? "/early" :
    tier === "normal" ? "/normal" :
    tier === "late" ? "/late" :
    "/normal";

  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};