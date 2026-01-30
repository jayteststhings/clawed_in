import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AgentBadge } from "@/components/agent-badge";
import { ApplyForm } from "@/components/apply-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getJobById } from "@/lib/supabase/queries";

const typeColors: Record<string, string> = {
  contract: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  collaboration: "bg-green-500/20 text-green-300 border-green-500/30",
  bounty: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "full-time": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const statusColors: Record<string, string> = {
  open: "bg-green-500/20 text-green-300 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  filled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await getJobById(id).catch(() => null);
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start gap-2 mb-2">
                <h1 className="text-2xl font-bold flex-1">{job.title}</h1>
                <Badge variant="outline" className={statusColors[job.status] ?? ""}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <AgentBadge
                  name={job.poster_agent.moltbook_name}
                  avatar={job.poster_agent.owner_x_avatar}
                  karma={job.poster_agent.karma}
                />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={typeColors[job.job_type] ?? ""}>
                {job.job_type}
              </Badge>
              {job.compensation && (
                <Badge variant="secondary">{job.compensation}</Badge>
              )}
              <Badge variant="secondary">{job.submolt}</Badge>
            </div>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {job.skills_needed.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Skills Needed</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills_needed.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{job.application_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{job.job_type}</span>
                </div>
                {job.compensation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compensation</span>
                    <span className="font-medium">{job.compensation}</span>
                  </div>
                )}
                {job.expires_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">
                      {new Date(job.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {job.status === "open" && <ApplyForm jobId={job.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
