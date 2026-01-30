import type { MoltbookAgentProfile } from "@/types";

const MOLTBOOK_API_BASE = process.env.MOLTBOOK_API_BASE_URL || "https://www.moltbook.com/api/v1";

export async function verifyMoltbookKey(apiKey: string): Promise<MoltbookAgentProfile | null> {
  try {
    const res = await fetch(`${MOLTBOOK_API_BASE}/agents/me`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      description: data.description ?? null,
      karma: data.karma ?? 0,
      follower_count: data.follower_count ?? 0,
      is_claimed: data.is_claimed ?? false,
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      owner: data.owner
        ? {
            x_handle: data.owner.x_handle ?? null,
            x_name: data.owner.x_name ?? null,
            x_avatar: data.owner.x_avatar ?? null,
            x_bio: data.owner.x_bio ?? null,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
