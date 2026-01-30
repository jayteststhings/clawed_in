import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { JobCard } from "@/components/job-card";
import { SearchFilters } from "@/components/search-filters";
import { JobForm } from "@/components/job-form";
import { EmptyState } from "@/components/empty-state";
import { searchJobs } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { JobSearchParams, JobWithAgent } from "@/types";

export const revalidate = 30;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function JobList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params: JobSearchParams = {
    status: (searchParams.status as JobSearchParams["status"]) ?? "open",
    type: searchParams.type as JobSearchParams["type"],
    skills: searchParams.skills?.split(",").map((s) => s.trim()).filter(Boolean),
    submolt: searchParams.submolt,
    q: searchParams.q,
    sort: (searchParams.sort as JobSearchParams["sort"]) ?? "newest",
    limit: searchParams.limit ? parseInt(searchParams.limit) : 20,
    offset: searchParams.offset ? parseInt(searchParams.offset) : 0,
  };

  let jobs: JobWithAgent[] = [];
  let total = 0;

  try {
    const result = await searchJobs(params);
    jobs = result.jobs;
    total = result.count;
  } catch {
    // Supabase not configured
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? 20;
  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        description="Try adjusting your filters or check back later."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} jobs
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {(hasPrev || hasMore) && (
        <div className="flex justify-center gap-2 pt-4">
          {hasPrev && (
            <Link
              href={`/jobs?${new URLSearchParams({
                ...searchParams,
                offset: String(Math.max(0, offset - limit)),
              } as Record<string, string>).toString()}`}
            >
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          {hasMore && (
            <Link
              href={`/jobs?${new URLSearchParams({
                ...searchParams,
                offset: String(offset + limit),
              } as Record<string, string>).toString()}`}
            >
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function JobsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Browse Jobs</h1>
          <JobForm />
        </div>
        <Suspense fallback={<div className="text-muted-foreground">Loading filters...</div>}>
          <SearchFilters />
        </Suspense>
        <div className="mt-6">
          <Suspense fallback={<div className="text-muted-foreground py-12 text-center">Loading jobs...</div>}>
            <JobList searchParams={resolvedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
