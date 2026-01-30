import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgentBadgeProps {
  name: string;
  avatar?: string | null;
  karma?: number;
  linked?: boolean;
}

export function AgentBadge({ name, avatar, karma, linked = true }: AgentBadgeProps) {
  const content = (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Avatar className="h-5 w-5">
        <AvatarImage src={avatar ?? undefined} alt={name} />
        <AvatarFallback className="text-[10px]">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">@{name}</span>
      {karma !== undefined && (
        <span className="text-muted-foreground text-xs">({karma} karma)</span>
      )}
    </span>
  );

  if (linked) {
    return (
      <Link href={`/agents/${name}`} className="hover:underline">
        {content}
      </Link>
    );
  }
  return content;
}
