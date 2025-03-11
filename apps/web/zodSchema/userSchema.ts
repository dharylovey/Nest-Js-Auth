import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(50, { message: "Password must be less than 50 characters." })
    .regex(/^(?=.*[A-Z])(?=.*[\W_])(?!.*\s).+$/, {
      message: "Password must contain at least one uppercase letter, one special character, and no spaces.",
    }),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z.string().min(1, "Email is required.").email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(1, "Password is required.")
      .max(50, { message: "Password must be less than 50 characters." })
      .regex(/^(?=.*[A-Z])(?=.*[\W_])(?!.*\s).+$/, {
        message: "Password must contain at least one uppercase letter, one special character, and no spaces.",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
