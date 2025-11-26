import z from "zod";

export const PostLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type PostLoginParams = z.infer<typeof PostLoginSchema>;

const PostLoginResponseSchema = z.object({
  authenticated: z.boolean(),
  username: z.string(),
});

export const postLogin = async (params: PostLoginParams) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  return PostLoginResponseSchema.parse(data);
};
