import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent, isAuthenticated } from "@/lib/auth";
import { getApplicationById, updateApplicationStatus, getJobById } from "@/lib/supabase/queries";
import { updateApplicationSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await authenticateAgent(request);
  if (!isAuthenticated(result)) return result;

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Applicant can only withdraw their own application
    if (status === "withdrawn") {
      if (application.applicant_agent_id !== result.agent.id) {
        return NextResponse.json({ error: "Only the applicant can withdraw" }, { status: 403 });
      }
    } else {
      // Accept/reject can only be done by the job poster
      const job = await getJobById(application.job_id);
      if (!job || job.poster_agent_id !== result.agent.id) {
        return NextResponse.json({ error: "Only the job poster can accept or reject applications" }, { status: 403 });
      }
    }

    const updated = await updateApplicationStatus(id, status);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
