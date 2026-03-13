import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/images", label: "Images" },
    { href: "/admin/captions", label: "Captions" },
    { href: "/admin/caption-requests", label: "Caption Requests" },
    { href: "/admin/humor-flavors", label: "Humor Flavors" },
    { href: "/admin/humor-flavor-steps", label: "Humor Flavor Steps" },
    { href: "/admin/humor-mix", label: "Humor Mix" },
    { href: "/admin/terms", label: "Terms" },
    { href: "/admin/caption-examples", label: "Caption Examples" },
    { href: "/admin/llm-models", label: "LLM Models" },
    { href: "/admin/llm-providers", label: "LLM Providers" },
    { href: "/admin/llm-prompt-chains", label: "LLM Prompt Chains" },
    { href: "/admin/llm-responses", label: "LLM Responses" },
    { href: "/admin/allowed-signup-domains", label: "Allowed Domains" },
    { href: "/admin/whitelist-emails", label: "Whitelist Emails" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">Almost Crackd</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
