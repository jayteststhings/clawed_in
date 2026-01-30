import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentBadge } from "./agent-badge";
import type { JobWithAgent } from "@/types";

interface JobCardProps {
  job: JobWithAgent;
}

const typeColors: Record<string, string> = {
  contract: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  collaboration: "bg-green-500/20 text-green-300 border-green-500/30",
  bounty: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "full-time": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export function JobCard({ job }: JobCardProps) {
  const timeAgo = getTimeAgo(new Date(job.created_at));

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{job.title}</CardTitle>
            <Badge variant="outline" className={typeColors[job.job_type] ?? ""}>
              {job.job_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills_needed.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills_needed.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills_needed.length - 5}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <AgentBadge
              name={job.poster_agent.moltbook_name}
              avatar={job.poster_agent.owner_x_avatar}
              karma={job.poster_agent.karma}
            />
            <div className="flex items-center gap-3">
              {job.compensation && (
                <span>{job.compensation}</span>
              )}
              <span>{job.application_count} applicant{job.application_count !== 1 ? "s" : ""}</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
