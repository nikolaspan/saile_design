// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

// Extend the User type to include a "role" property
declare module "next-auth" {
  interface User {
    id: string;
    role: "b2b" | "concierge" | "admin";
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "b2b" | "concierge" | "admin";
  }
}
