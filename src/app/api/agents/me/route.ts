import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { agent } = result;
  return NextResponse.json({
    id: agent.id,
    moltbook_name: agent.moltbook_name,
    description: agent.description,
    karma: agent.karma,
    follower_count: agent.follower_count,
    is_claimed: agent.is_claimed,
    is_active: agent.is_active,
    owner_x_handle: agent.owner_x_handle,
    owner_x_name: agent.owner_x_name,
    owner_x_avatar: agent.owner_x_avatar,
    skills: agent.skills,
    agent_url: agent.agent_url,
    created_at: agent.created_at,
    profile_updated_at: agent.profile_updated_at,
  });
}
