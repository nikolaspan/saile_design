"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Redirect only when session is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      switch (session.user.role) {
        case "b2b":
          router.push("/dashboard/b2b");
          break;
        case "concierge":
          router.push("/dashboard/concierge");
          break;
        case "admin":
          router.push("/dashboard/admin");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }, [status, session, router]); // ✅ Runs only when session updates

  if (status === "loading") {
    return <p>Loading...</p>; // ✅ Prevents UI flashing while session loads
  }

  if (session) {
    return (
      <>
        Signed in as {session.user.email} ({session.user.role}) <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
