import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { updateAgentSkills } from "@/lib/supabase/queries";
import { updateSkillsSchema } from "@/lib/validations";
import { invalidateCachedAgent } from "@/lib/auth-cache";

export async function PUT(request: NextRequest) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  try {
    const body = await request.json();
    const parsed = updateSkillsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateAgentSkills(result.agent.id, parsed.data.skills);
    invalidateCachedAgent(result.apiKeyHash);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
