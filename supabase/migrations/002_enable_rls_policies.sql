-- Migration: 002_enable_rls_policies.sql
-- Description: Enable Row Level Security and create access control policies for terms table
-- Author: Dara (Data Engineer)
-- Created: 2026-02-02
-- Purpose: Implement security-first access control with three policies:
--   1. Public Read Access - anyone can read glossary terms
--   2. Authenticated Admin Write - only admins can modify terms
--   3. Service Role Bypass - admin operations with elevated privileges

-- SAFETY: This migration uses IF NOT EXISTS and drops existing policies before creation
-- This ensures idempotency: can be safely re-run without errors

BEGIN;

-- ============================================================================
-- STEP 1: Enable Row Level Security on public.terms table
-- ============================================================================
-- RLS must be enabled before any policies can be created
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.terms IS 'Core glossary table with Row Level Security enabled for public read + admin write access.';

-- ============================================================================
-- STEP 2: Drop existing policies (clean slate for idempotency)
-- ============================================================================
-- Safe to drop if they exist; this handles re-runs gracefully
DROP POLICY IF EXISTS "public_read_access" ON public.terms;
DROP POLICY IF EXISTS "admin_full_access" ON public.terms;
DROP POLICY IF EXISTS "authenticated_read_access" ON public.terms;

-- ============================================================================
-- STEP 3: Create RLS Policies
-- ============================================================================

-- POLICY 1: Public Read Access
-- Everyone (authenticated or not) can read published glossary terms
-- Used for: User searches, term lookups, public glossary browsing
-- Access: SELECT only (no modification)
--
-- Rationale: Glossary is public content, but only active terms (deleted_at IS NULL)
-- Prevents exposing soft-deleted terms through RLS
CREATE POLICY "public_read_access" ON public.terms
  FOR SELECT
  USING (
    deleted_at IS NULL  -- Only show active (non-deleted) terms
  );

COMMENT ON POLICY "public_read_access" ON public.terms IS
  'Allows public (unauthenticated and authenticated) read access to active glossary terms. Used for term searches and discovery.';

-- POLICY 2: Authenticated Admin Write Access
-- Only users with admin role can INSERT, UPDATE, DELETE terms
-- Used for: Admin interface to add/edit/delete glossary entries
-- Access: INSERT, UPDATE, DELETE (full write access)
--
-- Rationale: Requires auth token with admin role in JWT
-- admin.ui() = true in JWT or auth.jwt()->>'role' = 'admin'
-- This prevents unauthorized modifications to the glossary
CREATE POLICY "admin_full_access" ON public.terms
  FOR ALL
  USING (
    -- Check if user has admin role in JWT token
    auth.jwt()->>'role' = 'admin'
    OR
    -- Alternative: check if user is in admin group (future extensibility)
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON POLICY "admin_full_access" ON public.terms IS
  'Allows only authenticated users with admin role to insert, update, and delete terms. Enforces content governance.';

-- ============================================================================
-- STEP 4: Create supporting tables for role-based access (optional for Phase 2)
-- ============================================================================
-- This table enables future extensibility for complex role hierarchies
-- Currently optional but recommended for scalability

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  granted_by UUID,

  -- Constraints
  UNIQUE(user_id, role),
  CONSTRAINT check_valid_role CHECK (role IN ('admin', 'moderator', 'contributor')),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_roles IS 'Role-based access control table. Maps users to roles (admin, moderator, contributor).';
COMMENT ON COLUMN public.user_roles.user_id IS 'Supabase Auth user ID (UUID)';
COMMENT ON COLUMN public.user_roles.role IS 'Role name: admin (full access), moderator (approve content), contributor (submit content)';
COMMENT ON COLUMN public.user_roles.granted_at IS 'When the role was assigned';
COMMENT ON COLUMN public.user_roles.granted_by IS 'Which admin granted this role (audit trail)';

-- Index for role lookups (used in RLS policy above)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
COMMENT ON INDEX idx_user_roles_user_id IS 'Speeds up role lookups in RLS policies';

-- ============================================================================
-- STEP 5: Testing and Validation Notes
-- ============================================================================
-- Test Cases:
--
-- TEST 1: Public/Unauthenticated Read
--   SELECT * FROM public.terms WHERE deleted_at IS NULL;
--   Expected: ✅ Returns all active terms (not authenticated needed)
--   Command: supabase client --no-auth
--
-- TEST 2: Authenticated User (non-admin) Read
--   SELECT * FROM public.terms LIMIT 1;
--   Expected: ✅ Can read terms (policy_1 allows SELECT)
--   Command: supabase client --user-id <user-id>
--
-- TEST 3: Authenticated User (non-admin) Write
--   INSERT INTO public.terms (term, definition, translation, category, examples, analogies)
--   VALUES ('test', 'test def', 'test trans', 'Desenvolvimento', '[]', '[]');
--   Expected: ❌ DENIED - no admin role
--   Command: supabase client --user-id <non-admin-user>
--
-- TEST 4: Authenticated Admin Write
--   INSERT INTO public.terms (term, definition, translation, category, examples, analogies)
--   VALUES ('test', 'test def', 'test trans', 'Desenvolvimento', '[]', '[]');
--   Expected: ✅ Succeeds - admin role granted
--   Command: supabase client --user-id <admin-user>
--
-- TEST 5: Service Role Bypass (backend proxy)
--   SELECT * FROM public.terms;
--   Expected: ✅ Bypasses RLS entirely (service role has all access)
--   Command: supabase client --role service_role
--   WARNING: Service role should only be used in trusted backend code
--
-- TEST 6: Soft Delete Filtering
--   - Create term, then soft delete (UPDATE deleted_at)
--   - SELECT * FROM public.terms should NOT show deleted term
--   - Expected: ✅ Deleted terms hidden from all users
--
-- ============================================================================

-- ============================================================================
-- STEP 6: Performance Considerations
-- ============================================================================
-- RLS Policy Impact Analysis:
--
-- 1. Public Read Policy:
--    - Uses simple WHERE clause: deleted_at IS NULL
--    - Already indexed: idx_terms_active (partial index)
--    - Expected performance impact: < 1% (query planner can use index)
--    - Estimated cost: +0ms for typical read queries
--
-- 2. Admin Access Policy:
--    - Uses JWT token check: auth.jwt()->>'role' = 'admin'
--    - Lookup in auth cache (no DB access needed)
--    - Also checks user_roles table (indexed on user_id)
--    - Expected performance impact: 1-2% (one additional index lookup)
--    - Estimated cost: +1-2ms for write operations (acceptable trade-off for security)
--
-- 3. Overall Impact:
--    - Reads: minimal impact (< 1ms)
--    - Writes: slight impact (1-2ms) due to role check
--    - Acceptable for security-first design
--
-- Future Optimization:
--    - Cache role lookups in session (reduces table access)
--    - Use Supabase JWT caching for faster token validation
--    - Monitor query plans with EXPLAIN ANALYZE after deployment
--
-- ============================================================================

COMMIT;
