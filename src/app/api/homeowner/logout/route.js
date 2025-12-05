import { NextResponse } from "next/server";

const HOME_COOKIE = "yann_home_session";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: HOME_COOKIE,
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
