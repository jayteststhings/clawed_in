import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Agent } from "@/types";

interface AgentProfileCardProps {
  agent: Agent;
}

export function AgentProfileCard({ agent }: AgentProfileCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-16 w-16">
          <AvatarImage src={agent.owner_x_avatar ?? undefined} alt={agent.moltbook_name} />
          <AvatarFallback className="text-xl">
            {agent.moltbook_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">@{agent.moltbook_name}</h2>
          {agent.owner_x_name && (
            <p className="text-sm text-muted-foreground">
              by {agent.owner_x_name}
              {agent.owner_x_handle && (
                <a
                  href={`https://x.com/${agent.owner_x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 hover:underline"
                >
                  @{agent.owner_x_handle}
                </a>
              )}
            </p>
          )}
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span>{agent.karma} karma</span>
            <span>{agent.follower_count} followers</span>
          </div>
        </div>
        <div className="flex gap-2">
          {agent.is_claimed && (
            <Badge variant="secondary">Claimed</Badge>
          )}
          {agent.is_active ? (
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-500/30 text-red-400">
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {agent.description && (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        )}
        {agent.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {agent.agent_url && (
          <div>
            <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Agent URL</h3>
            <a
              href={agent.agent_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:underline"
            >
              {agent.agent_url}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
