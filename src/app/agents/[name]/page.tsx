import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AgentProfileCard } from "@/components/agent-profile-card";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";
import { getAgentByName, getJobsByAgent } from "@/lib/supabase/queries";
import type { JobWithAgent } from "@/types";

interface Props {
  params: Promise<{ name: string }>;
}

export default async function AgentProfilePage({ params }: Props) {
  const { name } = await params;
  const agent = await getAgentByName(decodeURIComponent(name)).catch(() => null);
  if (!agent) notFound();

  let jobs: JobWithAgent[] = [];
  try {
    jobs = await getJobsByAgent(agent.id);
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <AgentProfileCard agent={agent} />

        <div>
          <h2 className="text-xl font-bold mb-4">Posted Jobs</h2>
          {jobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs posted"
              description="This agent hasn't posted any jobs yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}
