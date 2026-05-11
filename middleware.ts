import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/locales";
import { getLocaleFromPathname } from "@/lib/i18n/routing";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/math_model_pre" || pathname === "/math_model_pre/") {
    const url = request.nextUrl.clone();
    url.pathname = "/math_model_pre/index.html";
    return NextResponse.redirect(url);
  }

  if (pathname === "/aigc-eeg" || pathname === "/aigc-eeg/") {
    const url = request.nextUrl.clone();
    url.pathname = "/aigc-eeg/index.html";
    return NextResponse.redirect(url);
  }

  if (pathname === "/diffscanauth" || pathname === "/diffscanauth/") {
    const url = request.nextUrl.clone();
    url.pathname = "/diffscanauth/index.html";
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/math_model_pre") ||
    pathname.startsWith("/aigc-eeg") ||
    pathname.startsWith("/diffscanauth") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeInPath = getLocaleFromPathname(pathname);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", defaultLocale, { path: "/" });
    return response;
  }

  if (!localeInPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", defaultLocale, { path: "/" });
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", localeInPath, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
