import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { getJobById, updateJob, cancelJob } from "@/lib/supabase/queries";
import { updateJobSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.poster_agent_id !== result.agent.id) {
    return NextResponse.json({ error: "Not authorized to update this job" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateJob(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.poster_agent_id !== result.agent.id) {
    return NextResponse.json({ error: "Not authorized to delete this job" }, { status: 403 });
  }

  try {
    const cancelled = await cancelJob(id);
    return NextResponse.json(cancelled);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
