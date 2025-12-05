import { NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = "yann_session";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
