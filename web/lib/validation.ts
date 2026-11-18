// Zod schemas used to validate every piece of user input before it touches
// the database or the recommender. Keeping them in one file makes it easy
// to see exactly what the app accepts.
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  favoriteGenres: z
    .array(z.string())
    .min(3, "Please pick at least 3 genres"),
});

export const interactionSchema = z.object({
  movieId: z.number().int().positive(),
  action: z.enum(["click", "like", "rating"]),
  ratingValue: z.number().min(1).max(5).optional(),
}).refine(
  (data) => data.action !== "rating" || typeof data.ratingValue === "number",
  { message: "ratingValue is required when action is 'rating'", path: ["ratingValue"] }
);
