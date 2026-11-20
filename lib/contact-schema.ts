import { z } from "zod";

export const TOPICS = ["Commercial facility", "Industrial infrastructure", "Remote community", "Smart city / utility", "Research partnership", "Press", "Other"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(TOPICS, { message: "Please choose a topic." }),
  message: z.string().trim().min(20, "Please share a little more detail (at least 20 characters).").max(5000),
  consent: z.literal(true, { message: "Please confirm we may use your details to reply." }),
  // honeypot — must stay empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
