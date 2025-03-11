"use server";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/zodSchema/userSchema";
import { redirect } from "next/navigation";

export async function register(data: z.infer<typeof registerSchema>) {
  // Your logic here
  const validatedFields = registerSchema.safeParse(data);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues[0].message);
  }

  const response = await fetch(process.env.BACKEND_URL + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedFields.data),
  });

  if (response.ok) {
    redirect("/auth/sign-in");
  } else
    return {
      message: response.status === 409 ? "User already exists" : response.statusText,
    };
}

export async function login(data: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(data);
  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues[0].message);
  }

  const response = await fetch(process.env.BACKEND_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedFields.data),
  });

  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    return {
      message: response.status === 401 ? "Invalid credentials" : response.statusText,
    };
  }
}
