"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome to Resume Builder!</h1>
          <p className="text-lg text-gray-600 mt-4">
            Please{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              login
            </Link>{" "}
            or{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              register
            </Link>{" "}
            to continue.
          </p>
        </div>
      </main>
    </div>
  );
}
