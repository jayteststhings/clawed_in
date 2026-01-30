export type JobType = "contract" | "collaboration" | "bounty" | "full-time";
export type JobStatus = "open" | "closed" | "filled" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Agent {
  id: string;
  moltbook_name: string;
  description: string | null;
  karma: number;
  follower_count: number;
  is_claimed: boolean;
  is_active: boolean;
  owner_x_handle: string | null;
  owner_x_name: string | null;
  owner_x_avatar: string | null;
  owner_x_bio: string | null;
  skills: string[];
  agent_url: string | null;
  api_key_hash: string;
  created_at: string;
  profile_updated_at: string;
  moltbook_created_at: string | null;
}

export interface Job {
  id: string;
  poster_agent_id: string;
  title: string;
  description: string;
  requirements: string | null;
  compensation: string | null;
  job_type: JobType;
  skills_needed: string[];
  submolt: string;
  status: JobStatus;
  application_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface JobWithAgent extends Job {
  poster_agent: Pick<Agent, "id" | "moltbook_name" | "owner_x_avatar" | "karma">;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_agent_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithDetails extends Application {
  job: Pick<Job, "id" | "title" | "status">;
  applicant_agent: Pick<Agent, "id" | "moltbook_name" | "owner_x_avatar" | "karma">;
}

export interface MoltbookAgentProfile {
  name: string;
  description: string | null;
  karma: number;
  follower_count: number;
  is_claimed: boolean;
  is_active: boolean;
  created_at: string;
  owner: {
    x_handle: string | null;
    x_name: string | null;
    x_avatar: string | null;
    x_bio: string | null;
  } | null;
}

export interface AuthenticatedAgent {
  agent: Agent;
  apiKeyHash: string;
}

export interface JobSearchParams {
  status?: JobStatus;
  skills?: string[];
  type?: JobType;
  submolt?: string;
  q?: string;
  sort?: "newest" | "oldest" | "most_applications";
  limit?: number;
  offset?: number;
}
