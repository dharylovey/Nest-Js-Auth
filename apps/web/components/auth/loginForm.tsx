"use client";

import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ClipLoader from "react-spinners/ClipLoader";

import { toast } from "react-toastify";
import { loginSchema, LoginSchemaType } from "@/zodSchema/userSchema";
import PasswordInput from "../ui/password-input";
import { login } from "@/action/auth";
// import { useRouter } from "next/navigation";

const LoginForm = () => {
  // const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const result = loginSchema.safeParse(data);
      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }
      const loginData = {
        email: data.email,
        password: data.password,
      };

      console.log(loginData);
      await login(loginData);
      form.reset();
      // router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Form {...form}>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email below to login to your account</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PasswordInput field={field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <ClipLoader color="#ffffff" size={20} />
                <span className="ml-2">Logging in ...</span>
              </div>
            ) : (
              "Login"
            )}
          </Button>
          <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline" aria-disabled={isSubmitting}>
            Forgot password?
          </Link>
        </form>
        <div className="text-center text-sm">
          {`Don't have an account?   `}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline hover:text-blue-500">
            Sign up
          </Link>
        </div>
      </Form>
    </>
  );
};

export default LoginForm;
