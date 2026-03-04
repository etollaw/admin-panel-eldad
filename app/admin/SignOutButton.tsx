"use client";

import { signOut } from "./actions";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
    >
      Sign Out
    </button>
  );
}
