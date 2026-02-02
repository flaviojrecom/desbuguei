-- Migration: 001_create_terms_table.sql
-- Description: Create the terms table for storing technical glossary entries
-- Created: 2026-02-02
-- Status: IDEMPOTENT

-- Create the terms table with complete schema
CREATE TABLE IF NOT EXISTS public.terms (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core Fields
  term VARCHAR(255) NOT NULL UNIQUE,
  fullTerm VARCHAR(255),

  -- Category with validation
  category VARCHAR(100) NOT NULL,

  -- Text Content
  definition TEXT,
  phonetic VARCHAR(255),
  slang VARCHAR(255),
  translation VARCHAR(255),

  -- JSON Fields (examples, analogies, relatedTerms)
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  analogies JSONB NOT NULL DEFAULT '[]'::jsonb,
  relatedTerms JSONB DEFAULT '[]'::jsonb,

  -- Audit Fields
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- Add constraints
  CONSTRAINT check_category CHECK (
    category IN (
      'Desenvolvimento',
      'Infraestrutura',
      'Dados & IA',
      'Segurança',
      'Agile & Produto'
    )
  ),
  CONSTRAINT check_examples CHECK (jsonb_typeof(examples) = 'array'),
  CONSTRAINT check_analogies CHECK (jsonb_typeof(analogies) = 'array'),
  CONSTRAINT check_relatedTerms CHECK (jsonb_typeof(relatedTerms) = 'array')
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_terms_term ON public.terms(term);
CREATE INDEX IF NOT EXISTS idx_terms_category ON public.terms(category);
CREATE INDEX IF NOT EXISTS idx_terms_created_at ON public.terms(created_at);
CREATE INDEX IF NOT EXISTS idx_terms_deleted_at ON public.terms(deleted_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_terms_updated_at ON public.terms;
CREATE TRIGGER trigger_terms_updated_at
  BEFORE UPDATE ON public.terms
  FOR EACH ROW
  EXECUTE FUNCTION update_terms_updated_at();

-- Add table comments for documentation
COMMENT ON TABLE public.terms IS 'Technical glossary terms with multilingual support and structured examples';
COMMENT ON COLUMN public.terms.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN public.terms.term IS 'The term name (e.g., "API", "Docker")';
COMMENT ON COLUMN public.terms.fullTerm IS 'Full English expansion (e.g., "Application Programming Interface")';
COMMENT ON COLUMN public.terms.category IS 'Category: Desenvolvimento, Infraestrutura, Dados & IA, Segurança, Agile & Produto';
COMMENT ON COLUMN public.terms.definition IS 'Business-focused definition in Portuguese';
COMMENT ON COLUMN public.terms.phonetic IS 'Pronunciation hint in Portuguese';
COMMENT ON COLUMN public.terms.slang IS 'Common slang or abbreviation (e.g., "K8s" for Kubernetes)';
COMMENT ON COLUMN public.terms.translation IS 'Portuguese translation of the term essence';
COMMENT ON COLUMN public.terms.examples IS 'Array of business use case examples (JSON)';
COMMENT ON COLUMN public.terms.analogies IS 'Array of simple analogies (JSON)';
COMMENT ON COLUMN public.terms.relatedTerms IS 'Array of related term keywords (JSON)';
COMMENT ON COLUMN public.terms.created_at IS 'Record creation timestamp (auto-set)';
COMMENT ON COLUMN public.terms.updated_at IS 'Record last update timestamp (auto-updated)';
COMMENT ON COLUMN public.terms.deleted_at IS 'Soft delete timestamp (NULL if active)';

-- Verify table structure
SELECT 'Migration 001_create_terms_table completed successfully' AS status;
