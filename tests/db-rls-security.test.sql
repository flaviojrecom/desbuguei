-- RLS Security Test Suite

-- T1: Public user reads term (should succeed)
SELECT COUNT(*) as readable_terms FROM public.terms WHERE deleted_at IS NULL;

-- T2: Public user tries to create term (should fail with RLS violation)
-- INSERT INTO public.terms (term, category) VALUES ('test', 'Desenvolvimento');

-- T4: Admin reads term (should succeed with auth context)
SELECT COUNT(*) as admin_readable_terms FROM public.terms;

-- T7: Soft-deleted term visibility (should be hidden)
-- Need to test with soft-deleted record

-- Audit log verification
SELECT COUNT(*) as audit_entries FROM public.audit_log;

-- Performance check (should be <2ms)
EXPLAIN ANALYZE SELECT * FROM public.terms WHERE deleted_at IS NULL;
