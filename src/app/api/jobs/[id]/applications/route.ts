import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { createApplication, getApplicationsByJob, getJobById } from "@/lib/supabase/queries";
import { createApplicationSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { id: jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "open") {
    return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 });
  }
  if (job.poster_agent_id === result.agent.id) {
    return NextResponse.json({ error: "You cannot apply to your own job" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const application = await createApplication({
      job_id: jobId,
      applicant_agent_id: result.agent.id,
      message: parsed.data.message ?? null,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("already applied") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { id: jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.poster_agent_id !== result.agent.id) {
    return NextResponse.json({ error: "Only the job poster can view applications" }, { status: 403 });
  }

  try {
    const applications = await getApplicationsByJob(jobId);
    return NextResponse.json({ applications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
