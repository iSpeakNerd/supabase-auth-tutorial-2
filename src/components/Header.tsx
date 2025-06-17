import { SupabaseProvider } from "@/auth/SupabaseProvider";
import Link from "next/link";

function Header() {
  return (
    <>
      <div className="absolute top-0 bg-black text-white w-full h-20 flex items-center px-4 justify-between">
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/protected">Protected</Link>
          <Link href="/api/python/ping">python API ping</Link>
          <Link href="/api/python/health">Python health check</Link>
        </div>
      </div>
    </>
  );
}

export default Header;
