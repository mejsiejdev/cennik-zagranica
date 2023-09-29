import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  if (request.nextUrl.pathname === "/") return NextResponse.redirect(new URL("/pl", request.url));
}
