import { NextRequest, NextResponse } from "next/server";
import { verifyAuthSchema } from "@/lib/validations";
import { verifyMoltbookKey, hashApiKey } from "@/lib/moltbook";
import { upsertAgent } from "@/lib/supabase/queries";
import { setCachedAgent } from "@/lib/auth-cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { moltbookApiKey } = parsed.data;
    const profile = await verifyMoltbookKey(moltbookApiKey);
    if (!profile) {
      return NextResponse.json(
        { error: "Invalid Moltbook API key" },
        { status: 401 }
      );
    }

    const apiKeyHash = await hashApiKey(moltbookApiKey);
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

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        moltbook_name: agent.moltbook_name,
        description: agent.description,
        karma: agent.karma,
        skills: agent.skills,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
