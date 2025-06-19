"use server";

import { createSupabaseClient } from "@/auth/server";
import { getErrorMessage } from "@/lib/utils";
import { LoginSchema, type Login } from "@/app/login/page";

// const LoginSchema = z.object({
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z
//     .string()
//     .min(8, { message: "Must be 8 characters or more" })
//     .max(32, { message: "Must be 32 characters or less" }),
// });

export async function createAccountAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // ! does not validate email and password before passing to client, beware!

    const { auth } = await createSupabaseClient();

    const { error } = await auth.signUp({ email, password });

    if (error) {
      throw error;
    }
    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: getErrorMessage(error) };
  }
}

export async function loginActionT(credentials: Login) {
  try {
    const { email, password } = credentials;
    const { auth } = await createSupabaseClient();

    const { data, error } = await auth.signInWithPassword({ email, password });
    const jwt = data.session?.access_token;

    console.debug("user access_token = ", jwt);

    if (error) {
      throw error;
    }
    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: getErrorMessage(error) };
  }
}

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { auth } = await createSupabaseClient();

    const { data, error } = await auth.signInWithPassword({ email, password });
    const jwt = data.session?.access_token;

    console.debug("user access_token = ", jwt);

    if (error) {
      throw error;
    }
    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: getErrorMessage(error) };
  }
}

export async function signOutAction() {
  try {
    const { auth } = await createSupabaseClient();

    const { error } = await auth.signOut();
    if (error) {
      throw error;
    }
    return { errorMessage: null };
  } catch (error) {
    return { errorMessage: getErrorMessage(error) };
  }
}
