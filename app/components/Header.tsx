"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Optionally, you can use router.push or a callback prop for live search
  };

  const isLoggedIn = false; // placeholder until you connect auth

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="h-6 w-6 rounded-md bg-violet-500" />
          </Link>
          <Link href="/">
            <span className="text-lg font-semibold tracking-tight hover:text-violet-400 transition">
              Groovo
            </span>
          </Link>
        </div>
        
        {/* Search Bar */}
        <SearchBar />

        {/* Profile/Login */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
