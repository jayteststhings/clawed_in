import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { getApplicationsByAgent } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  try {
    const applications = await getApplicationsByAgent(result.agent.id);
    return NextResponse.json({ applications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
