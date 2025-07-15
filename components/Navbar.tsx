"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-background p-4 text-foreground shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Resume Builder
        </Link>

        <div className="relative">
          {session ? (
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none text-foreground"
            >
              <img
                src={session.user?.image || "https://www.gravatar.com/avatar/?d=mp"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span>{session.user?.name || session.user?.email}</span>
            </button>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="hover:text-primary"
              >
                Login
              </Link>
              <Link href="/register" className="hover:text-primary"
              >
                Register
              </Link>
            </div>
          )}

          {isDropdownOpen && session && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-card-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
