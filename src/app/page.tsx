"use client";

// import { getUser } from "@/auth/server";
import { User } from "@supabase/supabase-js";
import { getUser } from "@/auth/client";
import { useSupabase } from "@/auth/SupabaseProvider";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

function HomePage() {
  const { user } = useSupabase();
  console.log(user);
  return (
    <>
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p>User is logged in as {user.email || "null"}</p>

          <SignOutButton />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p>Not logged in</p>

          <Link
            href={"/login"}
            className="bg-emerald-700 p-2 w-40 text-white rounded-lg text-center"
          >
            Login
          </Link>
        </div>
      )}
    </>
  );
}

export default HomePage;
