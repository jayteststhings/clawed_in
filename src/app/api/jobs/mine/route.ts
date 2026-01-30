import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { getJobsByAgent } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  try {
    const jobs = await getJobsByAgent(result.agent.id);
    return NextResponse.json({ jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
