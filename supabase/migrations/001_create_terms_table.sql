-- Migration: 001_create_terms_table.sql
-- Description: Create the main terms table with full TermData schema
-- Author: Dara (Data Engineer)
-- Created: 2026-02-02
-- Purpose: Establish foundational database schema for Desbuquei glossary application

-- SAFETY: This migration uses IF NOT EXISTS to ensure idempotency
-- Multiple runs of this script will not cause errors

BEGIN;

-- Create ENUM type for categories
-- Using ENUM for strict type safety and better storage efficiency
CREATE TYPE category_type AS ENUM (
  'Desenvolvimento',
  'Infraestrutura',
  'Dados & IA',
  'Segurança',
  'Agile & Produto',
  'Outros'
);

-- COMMENT ON TYPE category_type IS 'Allowed category values for term classification';

-- Main terms table
-- Stores all glossary entries with full metadata
CREATE TABLE IF NOT EXISTS public.terms (
  -- Primary key and identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core term data (required fields)
  term VARCHAR(255) NOT NULL UNIQUE,
  fullTerm VARCHAR(500),
  category category_type NOT NULL,

  -- Detailed content (TEXT for flexibility)
  definition TEXT NOT NULL,
  phonetic VARCHAR(255),
  slang TEXT,
  translation TEXT NOT NULL,

  -- Complex structured data (JSONB for flexibility + indexability)
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  analogies JSONB NOT NULL DEFAULT '[]'::jsonb,
  practicalUsage JSONB,
  relatedTerms JSONB DEFAULT '[]'::jsonb,

  -- Audit fields (standard baseline)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Constraints for data integrity
  CONSTRAINT check_term_not_empty CHECK (term != ''),
  CONSTRAINT check_definition_not_empty CHECK (definition != ''),
  CONSTRAINT check_translation_not_empty CHECK (translation != ''),
  CONSTRAINT check_examples_is_array CHECK (jsonb_typeof(examples) = 'array'),
  CONSTRAINT check_analogies_is_array CHECK (jsonb_typeof(analogies) = 'array'),
  CONSTRAINT check_related_terms_is_array CHECK (jsonb_typeof(relatedTerms) = 'array')
);

-- Documentation
COMMENT ON TABLE public.terms IS 'Core glossary table storing all technical term definitions with business context for Portuguese-speaking technical professionals.';
COMMENT ON COLUMN public.terms.id IS 'Unique identifier (UUID) for each term';
COMMENT ON COLUMN public.terms.term IS 'The actual term name (unique, case-sensitive)';
COMMENT ON COLUMN public.terms.fullTerm IS 'English expansion or full name (e.g., "API" -> "Application Programming Interface")';
COMMENT ON COLUMN public.terms.category IS 'Classification category (enum-constrained for integrity)';
COMMENT ON COLUMN public.terms.definition IS 'Main business-focused explanation in Portuguese';
COMMENT ON COLUMN public.terms.phonetic IS 'Pronunciation hint (e.g., "Ei-pi-ai")';
COMMENT ON COLUMN public.terms.slang IS 'Common slang or alternative expressions (optional)';
COMMENT ON COLUMN public.terms.translation IS 'Portuguese essence or translation';
COMMENT ON COLUMN public.terms.examples IS 'Array of {title, description} objects showing practical business uses';
COMMENT ON COLUMN public.terms.analogies IS 'Array of {title, description} objects with simple analogies';
COMMENT ON COLUMN public.terms.practicalUsage IS 'Object with {title, content} showing real-world usage (code, terminal commands, etc.)';
COMMENT ON COLUMN public.terms.relatedTerms IS 'Array of related term IDs or names for discovery';
COMMENT ON COLUMN public.terms.created_at IS 'Timestamp when term was created (immutable)';
COMMENT ON COLUMN public.terms.updated_at IS 'Timestamp of last update (modified on each UPDATE)';
COMMENT ON COLUMN public.terms.deleted_at IS 'Soft delete timestamp (NULL = active, non-NULL = deleted)';

-- Indexes for query performance
-- Index 1: Category filtering and sorting
CREATE INDEX idx_terms_category_created ON public.terms(category, created_at DESC)
WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_terms_category_created IS 'Supports filtering by category with newest-first sorting, excluding soft-deleted records';

-- Index 2: Soft delete pattern
CREATE INDEX idx_terms_active ON public.terms(deleted_at)
WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_terms_active IS 'Supports efficient queries of active-only terms (soft delete pattern)';

-- Index 3: Full-text search preparation
CREATE INDEX idx_terms_term_gin ON public.terms USING GIN(to_tsvector('portuguese', term || ' ' || definition))
WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_terms_term_gin IS 'Supports full-text search in Portuguese (term name + definition)';

-- Index 4: JSONB containment queries
CREATE INDEX idx_terms_related_terms_gin ON public.terms USING GIN(relatedTerms)
WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_terms_related_terms_gin IS 'Supports efficient queries on relatedTerms JSONB array';

-- Enable Row Level Security (placeholder for Phase 2)
-- ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
-- (RLS policies will be created in TD-201)

COMMIT;
