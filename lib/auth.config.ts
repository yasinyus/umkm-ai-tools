import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const protectedRoutes = [
  "/dashboard",
  "/caption-generator",
  "/ai-image-editor",
  "/history",
  "/settings",
  "/hpp",
  "/competitors",
  "/reply-assistant",
  "/trends",
  "/catalog",
  "/scheduler",
  "/billing",
];

export const authConfig = {
  providers: [Google],
  pages: {
    signIn: "/",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = protectedRoutes.some((p) =>
        nextUrl.pathname.startsWith(p)
      );
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
