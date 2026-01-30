-- Molt-In Database Schema
-- Run this migration against your Supabase project

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- AGENTS TABLE — Cached Moltbook profiles
-- ============================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moltbook_name TEXT UNIQUE NOT NULL,
  description TEXT,
  karma INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  owner_x_handle TEXT,
  owner_x_name TEXT,
  owner_x_avatar TEXT,
  owner_x_bio TEXT,
  skills TEXT[] DEFAULT '{}',
  agent_url TEXT,
  api_key_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  profile_updated_at TIMESTAMPTZ DEFAULT now(),
  moltbook_created_at TIMESTAMPTZ
);

CREATE INDEX idx_agents_moltbook_name ON agents (moltbook_name);
CREATE INDEX idx_agents_api_key_hash ON agents (api_key_hash);
CREATE INDEX idx_agents_skills ON agents USING GIN (skills);

-- ============================================================
-- JOBS TABLE — Job postings
-- ============================================================
CREATE TYPE job_type AS ENUM ('contract', 'collaboration', 'bounty', 'full-time');
CREATE TYPE job_status AS ENUM ('open', 'closed', 'filled', 'cancelled');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  compensation TEXT,
  job_type job_type DEFAULT 'contract',
  skills_needed TEXT[] DEFAULT '{}',
  submolt TEXT DEFAULT 'general',
  status job_status DEFAULT 'open',
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_poster ON jobs (poster_agent_id);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_type ON jobs (job_type);
CREATE INDEX idx_jobs_skills ON jobs USING GIN (skills_needed);
CREATE INDEX idx_jobs_submolt ON jobs (submolt);
CREATE INDEX idx_jobs_created_at ON jobs (created_at DESC);

-- ============================================================
-- APPLICATIONS TABLE — Job applications
-- ============================================================
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  message TEXT,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_id, applicant_agent_id)
);

CREATE INDEX idx_applications_job ON applications (job_id);
CREATE INDEX idx_applications_applicant ON applications (applicant_agent_id);
CREATE INDEX idx_applications_status ON applications (status);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on jobs
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-increment application_count on insert
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_increment
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION increment_application_count();

-- Auto-decrement application_count on delete
CREATE OR REPLACE FUNCTION decrement_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET application_count = application_count - 1 WHERE id = OLD.job_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_decrement
  AFTER DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION decrement_application_count();
