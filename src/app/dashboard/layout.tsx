import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <nav className="flex items-center justify-between px-8 md:px-16 py-4 bg-white border-b border-black/[.08]">
        <Link href="/" className="serif text-xl">
          Côte Ouest <em className="italic" style={{ color: "var(--gold)" }}>Ads</em>
        </Link>
        <UserButton />
      </nav>
      <main className="flex-1 bg-[var(--light-gray)]">{children}</main>
    </div>
  );
}
