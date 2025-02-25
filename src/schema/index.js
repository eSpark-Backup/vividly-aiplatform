// ZOD VALIDATION SCHEMAS

import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()])[A-Za-z\d@$!%*?&#^()]{8,}$/;
const passwordRegexMessage = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"


// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password must be required"),
});


// Signup Schema
export const signupSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
  });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

//Verify Code Schema
export const verifyCodeSchema = z.object({
  code: z.string().min(8, "Code must be at least 8 characters"),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").regex(passwordRegex, passwordRegexMessage),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

//Create Password Schema
export const createPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").regex(passwordRegex, passwordRegexMessage),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


// Profile Schema
export const profileSchema = z.object({
  first_name: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "First name must be at least 2 characters long",
    }),

  last_name: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "Last name must be at least 2 characters long",
    }),

  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    }),

  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Phone number must be at least 10 characters long",
    }),

  address: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 5, {
      message: "Address must be at least 5 characters long",
    }),

  city: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "City must be at least 2 characters long",
    }),

  date_of_birth: z
    .date()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});
