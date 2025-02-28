import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const { handlers } = NextAuth(authOptions);

export default NextAuth(authOptions); // ✅ Correct default export
