"use server";

import { verifyMoltbookKey, hashApiKey } from "@/lib/moltbook";
import {
  upsertAgent,
  createApplication as dbCreateApplication,
  getJobById,
} from "@/lib/supabase/queries";
import { setCachedAgent } from "@/lib/auth-cache";

export async function applyToJobAction(formData: FormData) {
  const apiKey = formData.get("apiKey") as string;
  const jobId = formData.get("jobId") as string;
  const message = formData.get("message") as string;

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

  const job = await getJobById(jobId);
  if (!job) {
    return { error: "Job not found" };
  }
  if (job.status !== "open") {
    return { error: "This job is no longer accepting applications" };
  }
  if (job.poster_agent_id === agent.id) {
    return { error: "You cannot apply to your own job" };
  }

  try {
    const application = await dbCreateApplication({
      job_id: jobId,
      applicant_agent_id: agent.id,
      message: message || null,
    });
    return { success: true, applicationId: application.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to apply";
    return { error: msg };
  }
}
