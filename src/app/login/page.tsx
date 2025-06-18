"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
// import { useTransition } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { loginAction } from "@/actions/users";
import { useRouter } from "next/navigation";
import { useFormStatus, useFormState } from "react-dom";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const SubmitButton = () => {
  const status = useFormStatus();
  return (
    <button
      className="rounded-lg p-2 mt-4 bg-black text-white flex justify-center"
      disabled={status.pending}
    >
      {status.pending ? <Loader2 className="animate-spin" /> : "Login"}
    </button>
  );
};
const TextField = ({ label }: { label: string }) => {
  const status = useFormStatus();
  return (
    <>
      <input
        type="text"
        name={label}
        className="rounded-lg p-2"
        placeholder={label}
        disabled={status.pending}
      />
    </>
  );
};

const NumberField = ({ label }: { label: string }) => {
  const status = useFormStatus();
  return (
    <>
      <input
        type="number"
        name={label}
        className="rounded-lg p-2"
        placeholder={label}
        disabled={status.pending}
      />
    </>
  );
};
const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Must be 8 characters or more" })
    .max(32, { message: "Must be 32 characters or less" }),
});

function LoginPage() {
  const router = useRouter();

  const handleClickLoginButton = async (formData: FormData) => {
    // console.log("email\n", formData.get("email") as string);

    // console.log("\n\nform data\n", formData);
    const { errorMessage } = await loginAction(formData);

    if (errorMessage) {
      // formErrors.forEach((err) => toast.error(err));
      toast.error(errorMessage);
    } else {
      router.push("/");
      toast.success("Successfully logged in.");
    }
  };

  // const [isPending, startTransition] = useTransition();
  // const status = useFormStatus();
  // const isPending = status.pending;

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: LoginSchema,
    },
    onSubmit: ({ value }) => {
      alert(JSON.stringify(value, null, 2));
      loginAction;
    },
  });
  return (
    <div className="bg-emerald-700 w-96 rounded-lg p-8">
      <h1 className="text-2xl text-center mb-8">Login</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField
          name="email"
          children={(field) => <field.TextField label="Email" />}
        />
        <form.AppField
          name="password"
          children={(field) => <field.TextField label="password" />}
        />
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </form>
      {/* <form
        className="flex flex-col bg-emerald-700 gap-4"
        action={handleClickLoginButton}
      >
        <input
          type="email"
          name="email"
          className="rounded-lg p-2"
          placeholder="Email"
          // disabled={isPending}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="rounded-lg p-2"
          // disabled={isPending}
        />

        <SubmitButton />
      </form> */}

      <p className="text-center text-sm mt-4">
        Don't have an account?{" "}
        <Link href="/create-account" className="underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
