'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/demo", label: "Demo" },
];

type NavbarUser = {
  id: string;
  email?: string;
};

type NavbarProfile = {
  full_name?: string | null;
  avatar_color?: string | null;
  avatar_initials?: string | null;
  pack_tier?: string | null;
  credits?: number | null;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [profile, setProfile] = useState<NavbarProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async (userId: string) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_color, avatar_initials, pack_tier, credits")
        .eq("id", userId)
        .single();
      setProfile(profileData);
    };

    const init = async () => {
      // getUser() validates the token with Supabase rather than reading
      // the (possibly stale) local session, so it's reliable right after
      // navigating to a fresh public page.
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (authUser && !error) {
        setUser({ id: authUser.id, email: authUser.email });
        await loadProfile(authUser.id);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        await loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMenuOpen(false);
    setSigningOut(false);
    router.push("/");
  };

  const displayName = profile?.full_name || user?.email || "";

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)] sm:text-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Scrivly" style={{ height: "40px", width: "auto", cursor: "pointer" }} />
          Scrivly
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition hover:text-[var(--text-primary)]"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: pathname === link.href ? 600 : 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {loading ? (
            // Reserve space for the auth area so nothing shifts once it
            // resolves, but show nothing while we wait — avoids a flash
            // of placeholder boxes on every page load.
            <div style={{ width: "140px", height: "36px" }} />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span
                className="whitespace-nowrap rounded-[20px] px-[14px] py-[6px] text-[13px] font-medium"
                style={{
                  background: "rgba(255,184,0,0.15)",
                  border: "1px solid rgba(255,184,0,0.3)",
                  color: "#FFB800",
                  cursor: "default",
                }}
              >
                ⚡ {profile?.credits ?? 0} credits
              </span>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                title={user.email}
                className="block shrink-0 transition hover:opacity-80"
              >
                <Avatar profile={profile ?? undefined} email={user.email} size={36} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-56"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {displayName}
                    </p>
                    {profile?.full_name && (
                      <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                    )}
                    {profile?.pack_tier === "power" && (
                      <span
                        className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #FFB800, #FF3D8B, #7B2FFF)" }}
                      >
                        ⚡ Power Seller
                      </span>
                    )}
                    {profile?.pack_tier === "pro" && (
                      <span
                        className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "rgba(123,47,255,0.2)", color: "#CC99FF" }}
                      >
                        Pro
                      </span>
                    )}
                    {profile?.pack_tier === "starter" && (
                      <span
                        className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "rgba(100,100,100,0.2)", color: "var(--text-muted)" }}
                      >
                        Starter
                      </span>
                    )}
                  </div>
                  <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account/history"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Generation History
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Manage Account
                  </Link>
                  <Link
                    href="/account/purchases"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Purchase History
                  </Link>
                  <div className="my-1 border-t" style={{ borderColor: "var(--border-subtle)" }} />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-[rgba(255,61,139,0.1)] disabled:opacity-50"
                    style={{ color: "#FF3D8B" }}
                  >
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-[var(--border-default)] bg-transparent px-4 py-2 text-sm font-medium
                  text-[var(--text-primary)] transition hover:border-[var(--text-muted)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition
                  hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {!loading && user && (
            <Link href="/dashboard" title={user.email} className="block shrink-0 transition hover:opacity-80">
              <Avatar profile={profile ?? undefined} email={user.email} size={32} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] transition hover:border-[var(--text-muted)]"
          >
            {open ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-4 sm:px-6 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-[var(--border-default)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--text-muted)]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-[var(--border-default)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--text-muted)]"
                  >
                    Manage Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                    className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)] disabled:opacity-50"
                  >
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-[var(--border-default)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--text-muted)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
