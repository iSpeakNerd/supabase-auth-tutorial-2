"use client";

import { createSupabaseClient } from '@/auth/server';
import { getErrorMessage } from '@/lib/utils';
import {useRouter} from 'next/navigation'
import { useTransition } from 'react';
import toast from 'react-hot-toast';
import {signOutAction} from '@/actions/users'

function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition()

  const handleClickSignOutButton = async () => {
    startTransition(async ()=> {
      const {errorMessage} = await signOutAction()
    if (errorMessage) {
      toast.error(errorMessage)
    } else {
      router.push('/')
      toast.success('Successfully logged out.')
    }})
  }
    
  return (
    <button
      onClick={handleClickSignOutButton}
      className="rounded-lg p-2 text-white flex justify-center bg-emerald-700 w-40"
    >
      Sign Out
    </button>
  );
}

export default SignOutButton;
