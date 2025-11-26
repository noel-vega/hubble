import z from "zod";

export const FetchMeResponseSchema = z.object({
  authenticated: z.boolean(),
  username: z.string(),
});

export const fetchMe = async () => {
  const response = await fetch("/api/auth/me");
  const data = await response.json();
  return FetchMeResponseSchema.parse(data);
};
