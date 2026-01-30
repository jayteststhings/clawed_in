import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { createJob, searchJobs } from "@/lib/supabase/queries";
import { createJobSchema, jobSearchSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = jobSearchSchema.safeParse(searchParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = {
      ...parsed.data,
      skills: parsed.data.skills?.split(",").map((s) => s.trim()).filter(Boolean),
    };

    const { jobs, count } = await searchJobs(params);
    return NextResponse.json({ jobs, total: count, limit: params.limit, offset: params.offset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  try {
    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await createJob({
      ...parsed.data,
      poster_agent_id: result.agent.id,
      requirements: parsed.data.requirements ?? null,
      compensation: parsed.data.compensation ?? null,
      expires_at: parsed.data.expires_at ?? null,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
