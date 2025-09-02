import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "sid";
export const EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // don't want cookies to be minted for all requests, just page renders.
  const isDocument = req.headers.get("sec-fetch-dest") === "document";
  if (!isDocument) return res;

  let sid = req.cookies.get(COOKIE_NAME)?.value;
  if (!sid) {
    sid = crypto.randomUUID();
  }
    // rolling session: refresh expiry on activity
    res.cookies.set({
      name: COOKIE_NAME,
      value: sid,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRATION_IN_SECONDS,
  })
  return res;
}