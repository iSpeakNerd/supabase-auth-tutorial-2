"use client";

import { Loader2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { type Login, LoginSchema } from "@/actions/users";
import toast from "react-hot-toast";
import { loginActionT } from "@/actions/users";
import { useRouter } from "next/navigation";
import {
  createFormHook,
  createFormHookContexts,
  FormState,
  useField,
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
          aria-label="Login"
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
  // console.debug(`${label} field.state.meta.errors:`, field.state.meta.errors.map);
  // field.state.meta.errors.map((err: any) =>
  //   console.debug(JSON.stringify(err.message, null, 2))
  // );
  // const errors = field.state.meta.errors;
  const fieldMeta = field.state.meta;
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
      {fieldMeta.isTouched && !fieldMeta.isValid && (
        <div className="text-red-500 font-bold text-sm">
          {field.state.meta.errors[0]?.message as string}
        </div>
      )}
    </>
  );
};
const FieldInfo = ({
  fieldMeta,
}: {
  fieldMeta: ReturnType<typeof useField>["state"]["meta"] | undefined;
}) => {
  if (!fieldMeta) return null;
  console.log(fieldMeta.errors);
  return (
    <>
      {fieldMeta.isTouched && fieldMeta.errors.length ? (
        <div className="font-bold text-blue-500 text-sm">
          {/* @ts-expect-error */}
          {fieldMeta.errors[0]?.message as string}
        </div>
      ) : null}
      {fieldMeta.isValidating ? "Validating..." : null}
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

// export const LoginSchema = z.object({
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z
//     .string()
//     .min(8, { message: "Must be 8 characters or more" })
//     .max(32, { message: "Must be 32 characters or less" }),
// });
// export type Login = z.infer<typeof LoginSchema>;

function LoginPage() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      // alert(JSON.stringify(value, null, 2));
      // console.log(value);
      const { errorMessage } = await loginActionT(value);

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        router.push("/");
        toast.success("Successfully logged in.");
      }
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
        {/* inline form field */}
        {/* 
        <form.AppField
          name="email"
          // what to render
          children={(field) => (
            <>
              <div>
                <input
                  type="text"
                  name={field.name}
                  className="rounded-lg p-2"
                  placeholder={"Email"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={(e) => field.handleBlur?.()}
                />
                
                {field.getMeta().isValidating && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <LoaderCircle className="animate-spin" />
                  </div>
                )}
              </div>
              
              {field.state.meta.isTouched && !field.state.meta.isValid && (
                <div className="text-red-500 font-bold text-sm">
                  {field.state.meta.errors[0]?.message as string}
                </div>
              )}
            </>
          )}
        /> 
        */}

        {/* form field from formContext */}
        <form.AppField
          name="email"
          children={(field) => (
            <div>
              <field.TextField label="Email" field={field} />
              {/* <FieldInfo
                fieldMeta={
                  field.state.meta as ReturnType<
                    typeof useField
                  >["state"]["meta"]
                }
              /> */}
            </div>
          )}
        />
        <form.AppField
          name="password"
          // what to render
          children={(field) => (
            <>
              <div>
                <input
                  type="password"
                  name={field.name}
                  id={`${field.name}-input`}
                  className="rounded-lg p-2 mt-2"
                  placeholder={"Password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={(e) => field.handleBlur?.()}
                />
                {/* display spinner when validating */}
                {field.getMeta().isValidating && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <LoaderCircle className="animate-spin" />
                  </div>
                )}
              </div>
              {/* show field errors after input */}
              {field.state.meta.isTouched && !field.state.meta.isValid && (
                <div
                  className="text-red-500 font-bold text-sm"
                  id={`error-${field.name}`}
                  aria-label={`${field.name} error`}
                >
                  {field.state.meta.errors[0]?.message as string}
                </div>
              )}
            </>
          )}
        />
        <form.AppForm>
          <form.SubmitButton form={form} />
        </form.AppForm>
      </form>

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
