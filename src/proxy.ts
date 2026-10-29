import { NextResponse, type NextRequest } from "next/server";

// Grobe Vorprüfung; die echte Signaturprüfung passiert serverseitig in requireSession().
export function proxy(req: NextRequest) {
  if (!req.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
