"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
// import { useTransition } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { loginAction } from "@/actions/users";
import { useRouter } from "next/navigation";
import { useFormStatus, useFormState } from "react-dom";
import {
  createFormHook,
  createFormHookContexts,
  FormState,
} from "@tanstack/react-form";

const SubmitButton = ({ form }: { form: any }) => {
  return (
    <form.Subscribe>
      {({
        canSubmit,
        isSubmitting,
      }: {
        canSubmit: boolean;
        isSubmitting: boolean;
      }) => (
        <button
          className="rounded-lg p-2 mt-4 bg-black text-white flex justify-center disabled:cursor-not-allowed"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Login"}
        </button>
      )}
    </form.Subscribe>
  );
};
const TextField = ({
  label,
  field,
  type,
}: {
  label: string;
  field?: any;
  type?: string;
}) => {
  // Log the full error objects for debugging
  // console.log(`${label} field.state.meta.errors:`, field.state.meta.errors.map);
  // field.state.meta.errors.map((err: any) =>
  //   console.log(JSON.stringify(err.message, null, 2))
  // );
  // const errors = field.state.meta.errors;
  return (
    <>
      <input
        type={type || "text"}
        name={label.toLowerCase()}
        className="rounded-lg p-2 mt-2 first:mt-0 last:mb-0"
        placeholder={label}
        value={field?.state.value}
        onChange={(e) => field?.handleChange(e.target.value)}
        onBlur={(e) => field?.handleBlur?.()}
      />
      {!field.state.meta.isValid && (
        <div className="text-red-500 font-bold text-sm">
          {JSON.stringify(field.state.meta.errors[0]?.message, null, 2)};
        </div>
      )}
    </>
  );
};

const NumberField = ({ label }: { label: string }) => {
  return (
    <>
      <input
        type="number"
        name={label}
        className="rounded-lg p-2"
        placeholder={label}
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
    SubmitButton: ({ form }: { form: any }) => <SubmitButton form={form} />,
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
      onBlur: LoginSchema,
    },
    onSubmit: ({ value }) => {
      alert(JSON.stringify(value, null, 2));
      // loginAction;
      console.log(value);
    },
    // onSubmitInvalid: ({ value }) => {
    //   alert("invalid submission\n");
    //   console.log(
    //     new Error("invalid submission\n" + JSON.stringify(value, null, 2))
    //   );
    //   console.log(value);
    // },
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
          children={(field) => <field.TextField label="Email" field={field} />}
        />

        <form.AppField
          name="password"
          children={(field) => (
            <field.TextField label="Password" field={field} type="password" />
          )}
        />
        <form.AppForm>
          <form.SubmitButton form={form} />
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
