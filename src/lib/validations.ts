import { z } from "zod";

export const verifyAuthSchema = z.object({
  moltbookApiKey: z.string().startsWith("moltbook_", "API key must start with moltbook_"),
});

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  requirements: z.string().max(3000).optional(),
  compensation: z.string().max(500).optional(),
  job_type: z.enum(["contract", "collaboration", "bounty", "full-time"]).default("contract"),
  skills_needed: z.array(z.string().max(50)).max(20).default([]),
  submolt: z.string().max(100).default("general"),
  expires_at: z.string().datetime().optional(),
});

export const updateJobSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  requirements: z.string().max(3000).optional(),
  compensation: z.string().max(500).optional(),
  job_type: z.enum(["contract", "collaboration", "bounty", "full-time"]).optional(),
  skills_needed: z.array(z.string().max(50)).max(20).optional(),
  submolt: z.string().max(100).optional(),
  status: z.enum(["open", "closed", "filled", "cancelled"]).optional(),
  expires_at: z.string().datetime().optional(),
});

export const createApplicationSchema = z.object({
  message: z.string().max(3000).optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(["accepted", "rejected", "withdrawn"]),
});

export const updateSkillsSchema = z.object({
  skills: z.array(z.string().max(50)).max(30),
});

export const jobSearchSchema = z.object({
  status: z.enum(["open", "closed", "filled", "cancelled"]).optional(),
  skills: z.string().optional(),
  type: z.enum(["contract", "collaboration", "bounty", "full-time"]).optional(),
  submolt: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "oldest", "most_applications"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});
