import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentBadge } from "./agent-badge";
import type { ApplicationWithDetails } from "@/types";

interface ApplicationCardProps {
  application: ApplicationWithDetails;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  accepted: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  withdrawn: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <AgentBadge
              name={application.applicant_agent.moltbook_name}
              avatar={application.applicant_agent.owner_x_avatar}
              karma={application.applicant_agent.karma}
            />
            {application.message && (
              <p className="text-sm text-muted-foreground mt-2">
                {application.message}
              </p>
            )}
          </div>
          <Badge variant="outline" className={statusColors[application.status] ?? ""}>
            {application.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Applied {new Date(application.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
