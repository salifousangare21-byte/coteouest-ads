"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div id="scrollProgress" style={{ width: `${progress}%` }} />
      <nav
        className={`site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-4 bg-white/95 backdrop-blur-md border-b border-black/[.08] ${scrolled ? "scrolled" : ""}`}
      >
        <span className="serif text-xl">
          Côte Ouest <em className="italic" style={{ color: "var(--gold)" }}>Digital</em>
        </span>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="nav-link text-sm hover:opacity-60 transition-opacity">
            Se connecter
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Créer mon compte
          </Link>
        </div>
      </nav>
    </>
  );
}
