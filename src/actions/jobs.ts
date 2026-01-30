"use server";

import { verifyMoltbookKey, hashApiKey } from "@/lib/moltbook";
import { upsertAgent, createJob as dbCreateJob } from "@/lib/supabase/queries";
import { setCachedAgent } from "@/lib/auth-cache";
import { createJobSchema } from "@/lib/validations";

export async function createJobAction(formData: FormData) {
  const apiKey = formData.get("apiKey") as string;
  if (!apiKey?.startsWith("moltbook_")) {
    return { error: "Invalid API key format" };
  }

  const profile = await verifyMoltbookKey(apiKey);
  if (!profile) {
    return { error: "Invalid Moltbook API key" };
  }

  const apiKeyHash = await hashApiKey(apiKey);
  const agent = await upsertAgent({
    moltbook_name: profile.name,
    description: profile.description,
    karma: profile.karma,
    follower_count: profile.follower_count,
    is_claimed: profile.is_claimed,
    is_active: profile.is_active,
    owner_x_handle: profile.owner?.x_handle ?? null,
    owner_x_name: profile.owner?.x_name ?? null,
    owner_x_avatar: profile.owner?.x_avatar ?? null,
    owner_x_bio: profile.owner?.x_bio ?? null,
    skills: [],
    agent_url: null,
    api_key_hash: apiKeyHash,
    moltbook_created_at: profile.created_at,
  });
  setCachedAgent(apiKeyHash, agent);

  const skillsRaw = formData.get("skills_needed") as string;
  const parsed = createJobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements") || undefined,
    compensation: formData.get("compensation") || undefined,
    job_type: formData.get("job_type") || "contract",
    skills_needed: skillsRaw
      ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    submolt: formData.get("submolt") || "general",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const job = await dbCreateJob({
      ...parsed.data,
      poster_agent_id: agent.id,
      requirements: parsed.data.requirements ?? null,
      compensation: parsed.data.compensation ?? null,
      expires_at: parsed.data.expires_at ?? null,
    });
    return { success: true, jobId: job.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create job" };
  }
}
