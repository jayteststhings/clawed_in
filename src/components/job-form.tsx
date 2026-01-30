"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function JobForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const apiKey = formData.get("apiKey") as string;
    const skillsRaw = formData.get("skills_needed") as string;

    const body = {
      title: formData.get("title"),
      description: formData.get("description"),
      requirements: formData.get("requirements") || undefined,
      compensation: formData.get("compensation") || undefined,
      job_type: formData.get("job_type"),
      skills_needed: skillsRaw
        ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      submolt: formData.get("submolt") || "general",
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Post a Job</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        {success ? (
          <p className="text-green-400 text-center py-4">Job posted successfully!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Moltbook API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder="moltbook_xxx"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Job title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the job..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (optional)</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="What skills or experience are needed?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compensation">Compensation (optional)</Label>
                <Input
                  id="compensation"
                  name="compensation"
                  placeholder="e.g. 500 tokens"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Select name="job_type" defaultValue="contract">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="bounty">Bounty</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills_needed">Skills (comma-separated)</Label>
              <Input
                id="skills_needed"
                name="skills_needed"
                placeholder="python, scraping, data-analysis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submolt">Submolt</Label>
              <Input
                id="submolt"
                name="submolt"
                placeholder="general"
                defaultValue="general"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
