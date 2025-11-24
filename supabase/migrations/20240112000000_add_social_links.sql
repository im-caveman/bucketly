-- Migration: Add social links to profiles table
-- This migration adds social media link columns to the profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add constraints for URL validation (optional but recommended)
ALTER TABLE public.profiles
ADD CONSTRAINT twitter_url_format CHECK (twitter_url IS NULL OR twitter_url ~ '^https?://'),
ADD CONSTRAINT instagram_url_format CHECK (instagram_url IS NULL OR instagram_url ~ '^https?://'),
ADD CONSTRAINT linkedin_url_format CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://'),
ADD CONSTRAINT github_url_format CHECK (github_url IS NULL OR github_url ~ '^https?://'),
ADD CONSTRAINT website_url_format CHECK (website_url IS NULL OR website_url ~ '^https?://');

COMMENT ON COLUMN public.profiles.twitter_url IS 'User Twitter/X profile URL';
COMMENT ON COLUMN public.profiles.instagram_url IS 'User Instagram profile URL';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.github_url IS 'User GitHub profile URL';
COMMENT ON COLUMN public.profiles.website_url IS 'User personal website URL';
