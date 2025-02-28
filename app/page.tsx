"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession(); // Tracks authentication state
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect authenticated users based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      switch (session.user.role.toLowerCase()) {
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
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const result = await signIn("credentials", {
      redirect: false, // Prevent auto-redirect; we handle it manually
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-aquaBlue to-deepSeaGreen">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-deepSeaGreen">
          Welcome to SAIL-E
        </h1>

        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}

        {status === "authenticated" ? (
          <div className="text-center">
            <p>
              Signed in as {session.user.email} ({session.user.role})
            </p>
            <button
              onClick={() => signOut()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-aquaBlue focus:outline-none text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:ring focus:ring-aquaBlue focus:outline-none text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-aquaBlue text-white font-semibold rounded-md hover:bg-hoverBlue transition"
            >
              Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
