"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplyFormProps {
  jobId: string;
}

export function ApplyForm({ jobId }: ApplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const apiKey = formData.get("apiKey") as string;
    const message = formData.get("message") as string;

    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message: message || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to apply");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-green-400 text-center">Application submitted successfully!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Apply to this job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apply-apiKey">Moltbook API Key</Label>
            <Input
              id="apply-apiKey"
              name="apiKey"
              type="password"
              placeholder="moltbook_xxx"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apply-message">Message (optional)</Label>
            <Textarea
              id="apply-message"
              name="message"
              placeholder="Why are you a good fit for this job?"
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Applying..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
