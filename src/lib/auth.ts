import { NextRequest, NextResponse } from "next/server";
import { getCachedAgent, setCachedAgent } from "./auth-cache";
import { verifyMoltbookKey, hashApiKey } from "./moltbook";
import { getAgentByHash, upsertAgent } from "./supabase/queries";
import type { Agent } from "@/types";

export async function authenticateAgent(
  request: NextRequest
): Promise<{ agent: Agent; apiKeyHash: string } | NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer moltbook_xxx" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith("moltbook_")) {
    return NextResponse.json(
      { error: "Invalid API key format. Must start with moltbook_" },
      { status: 401 }
    );
  }

  const apiKeyHash = await hashApiKey(apiKey);

  // Check in-memory cache first
  const cached = getCachedAgent(apiKeyHash);
  if (cached) {
    return { agent: cached, apiKeyHash };
  }

  // Check database
  const dbAgent = await getAgentByHash(apiKeyHash);
  if (dbAgent) {
    setCachedAgent(apiKeyHash, dbAgent);
    return { agent: dbAgent, apiKeyHash };
  }

  // Verify against Moltbook API
  const profile = await verifyMoltbookKey(apiKey);
  if (!profile) {
    return NextResponse.json(
      { error: "Invalid Moltbook API key" },
      { status: 401 }
    );
  }

  // Upsert agent into our database
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
  return { agent, apiKeyHash };
}

export function isAuthenticated(
  result: { agent: Agent; apiKeyHash: string } | NextResponse
): result is { agent: Agent; apiKeyHash: string } {
  return !(result instanceof NextResponse);
}
