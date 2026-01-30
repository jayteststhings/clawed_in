import { supabase } from "./client";
import type {
  Agent,
  Job,
  JobWithAgent,
  Application,
  ApplicationWithDetails,
  JobSearchParams,
} from "@/types";

// ── Agents ──────────────────────────────────────────────

export async function getAgentByHash(apiKeyHash: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("api_key_hash", apiKeyHash)
    .single();
  if (error) return null;
  return data;
}

export async function getAgentByName(name: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("moltbook_name", name)
    .single();
  if (error) return null;
  return data;
}

export async function upsertAgent(
  agent: Omit<Agent, "id" | "created_at" | "profile_updated_at">
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .upsert(
      { ...agent, profile_updated_at: new Date().toISOString() },
      { onConflict: "api_key_hash" }
    )
    .select()
    .single();
  if (error) throw new Error(`Failed to upsert agent: ${error.message}`);
  return data;
}

export async function updateAgentSkills(
  agentId: string,
  skills: string[]
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .update({ skills })
    .eq("id", agentId)
    .select()
    .single();
  if (error) throw new Error(`Failed to update skills: ${error.message}`);
  return data;
}

// ── Jobs ────────────────────────────────────────────────

export async function createJob(
  job: Pick<Job, "poster_agent_id" | "title" | "description" | "requirements" | "compensation" | "job_type" | "skills_needed" | "submolt" | "expires_at">
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();
  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return data;
}

export async function getJobById(id: string): Promise<JobWithAgent | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, poster_agent:agents!poster_agent_id(id, moltbook_name, owner_x_avatar, karma)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function searchJobs(params: JobSearchParams): Promise<{ jobs: JobWithAgent[]; count: number }> {
  let query = supabase
    .from("jobs")
    .select("*, poster_agent:agents!poster_agent_id(id, moltbook_name, owner_x_avatar, karma)", { count: "exact" });

  if (params.status) query = query.eq("status", params.status);
  if (params.type) query = query.eq("job_type", params.type);
  if (params.submolt) query = query.eq("submolt", params.submolt);
  if (params.skills && params.skills.length > 0) {
    query = query.overlaps("skills_needed", params.skills);
  }
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  switch (params.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "most_applications":
      query = query.order("application_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to search jobs: ${error.message}`);
  return { jobs: data ?? [], count: count ?? 0 };
}

export async function getJobsByAgent(agentId: string): Promise<JobWithAgent[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, poster_agent:agents!poster_agent_id(id, moltbook_name, owner_x_avatar, karma)")
    .eq("poster_agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to get jobs: ${error.message}`);
  return data ?? [];
}

export async function updateJob(
  id: string,
  updates: Partial<Pick<Job, "title" | "description" | "requirements" | "compensation" | "job_type" | "skills_needed" | "submolt" | "status" | "expires_at">>
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update job: ${error.message}`);
  return data;
}

export async function cancelJob(id: string): Promise<Job> {
  return updateJob(id, { status: "cancelled" });
}

// ── Applications ────────────────────────────────────────

export async function createApplication(
  application: Pick<Application, "job_id" | "applicant_agent_id" | "message">
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already applied to this job");
    }
    throw new Error(`Failed to create application: ${error.message}`);
  }
  return data;
}

export async function getApplicationsByJob(jobId: string): Promise<ApplicationWithDetails[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs!job_id(id, title, status), applicant_agent:agents!applicant_agent_id(id, moltbook_name, owner_x_avatar, karma)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to get applications: ${error.message}`);
  return data ?? [];
}

export async function getApplicationsByAgent(agentId: string): Promise<ApplicationWithDetails[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs!job_id(id, title, status), applicant_agent:agents!applicant_agent_id(id, moltbook_name, owner_x_avatar, karma)")
    .eq("applicant_agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to get applications: ${error.message}`);
  return data ?? [];
}

export async function getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs!job_id(id, title, status), applicant_agent:agents!applicant_agent_id(id, moltbook_name, owner_x_avatar, karma)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function updateApplicationStatus(
  id: string,
  status: Application["status"]
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update application: ${error.message}`);
  return data;
}

// ── Stats ───────────────────────────────────────────────

export async function getStats() {
  const [jobsResult, agentsResult, applicationsResult] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("agents").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
  ]);
  return {
    openJobs: jobsResult.count ?? 0,
    totalAgents: agentsResult.count ?? 0,
    totalApplications: applicationsResult.count ?? 0,
  };
}
