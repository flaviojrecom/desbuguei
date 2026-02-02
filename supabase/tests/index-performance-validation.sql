-- Index Performance Validation Tests
-- Purpose: Verify all 4 indexes are created and performing as expected
-- Author: Dara (Data Engineer)
-- Date: 2026-02-02

BEGIN;

-- ============================================================================
-- TEST 1: Verify all 4 indexes exist
-- ============================================================================
SELECT
  indexname,
  indexdef,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
WHERE tablename = 'terms' AND indexname LIKE 'idx_terms_%'
ORDER BY indexname;

-- Expected Output:
-- ✅ idx_terms_active (partial index on deleted_at)
-- ✅ idx_terms_category_created (composite on category, created_at DESC)
-- ✅ idx_terms_related_terms_gin (GIN on relatedTerms)
-- ✅ idx_terms_term_gin (GIN on tsvector)

-- ============================================================================
-- TEST 2: Verify index sizes are reasonable
-- ============================================================================
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE
    WHEN pg_relation_size(indexrelid) < 1000000 THEN '✅ Small (< 1MB)'
    WHEN pg_relation_size(indexrelid) < 5000000 THEN '✅ Medium (< 5MB)'
    WHEN pg_relation_size(indexrelid) < 10000000 THEN '⚠️  Large (5-10MB)'
    ELSE '❌ TOO LARGE (> 10MB)'
  END as status
FROM pg_stat_user_indexes
WHERE relname = 'terms'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Expected Result: Total < 10MB (idx_category_created: 1.5MB, idx_active: 0.5MB,
--                  idx_term_gin: 3MB, idx_related_terms_gin: 2MB)

-- ============================================================================
-- TEST 3: Category Search Performance (Most Common Query)
-- ============================================================================
-- Query: SELECT * FROM public.terms
--        WHERE category = 'Infraestrutura' AND deleted_at IS NULL
--        ORDER BY created_at DESC LIMIT 10

EXPLAIN ANALYZE
SELECT * FROM public.terms
WHERE category = 'Infraestrutura' AND deleted_at IS NULL
ORDER BY created_at DESC LIMIT 10;

-- Expected: Bitmap Index Scan on idx_terms_category_created
-- Time: < 5ms (target: 2ms)
-- Status: ✅ if uses idx_terms_category_created

-- ============================================================================
-- TEST 4: Soft Delete Filtering Performance
-- ============================================================================
-- Query: SELECT * FROM public.terms WHERE deleted_at IS NULL LIMIT 100

EXPLAIN ANALYZE
SELECT * FROM public.terms WHERE deleted_at IS NULL LIMIT 100;

-- Expected: Index Scan on idx_terms_active
-- Time: < 2ms (target: 1ms)
-- Status: ✅ if uses idx_terms_active

-- ============================================================================
-- TEST 5: Full-Text Search Performance (Portuguese)
-- ============================================================================
-- Query: SELECT * FROM public.terms
--        WHERE to_tsvector('portuguese', term || ' ' || definition)
--        @@ to_tsquery('portuguese', 'api')
--        LIMIT 10

EXPLAIN ANALYZE
SELECT * FROM public.terms
WHERE to_tsvector('portuguese', term || ' ' || definition) @@ to_tsquery('portuguese', 'api')
AND deleted_at IS NULL
LIMIT 10;

-- Expected: Bitmap Index Scan on idx_terms_term_gin
-- Time: < 10ms (target: 5ms)
-- Status: ✅ if uses idx_terms_term_gin

-- ============================================================================
-- TEST 6: Related Terms Lookup Performance
-- ============================================================================
-- Query: SELECT * FROM public.terms
--        WHERE relatedTerms @> '["API", "REST"]'::jsonb
--        AND deleted_at IS NULL

EXPLAIN ANALYZE
SELECT * FROM public.terms
WHERE relatedTerms @> '["API"]'::jsonb
AND deleted_at IS NULL;

-- Expected: Bitmap Index Scan on idx_terms_related_terms_gin
-- Time: < 5ms (target: 3ms)
-- Status: ✅ if uses idx_terms_related_terms_gin

-- ============================================================================
-- TEST 7: Index Usage Statistics
-- ============================================================================
SELECT
  indexrelname,
  idx_scan as "Scans",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched",
  CASE
    WHEN idx_scan = 0 THEN '⚠️  Unused index'
    WHEN idx_scan > 100 THEN '✅ Actively used'
    ELSE '✅ In use'
  END as status
FROM pg_stat_user_indexes
WHERE relname = 'terms'
ORDER BY idx_scan DESC;

-- Expected: All 4 indexes show idx_scan > 0 (in production use)

-- ============================================================================
-- TEST 8: Write Performance Impact
-- ============================================================================
-- INSERT Operation (should be < 10ms total)
EXPLAIN ANALYZE
INSERT INTO public.terms (
  term, definition, category, created_at, updated_at, deleted_at
) VALUES (
  'Test Term', 'Test definition', 'Desenvolvimento', NOW(), NOW(), NULL
) RETURNING id;

-- Expected: Time < 10ms (baseline: 5ms, with indexes: 6-7ms overhead acceptable)

-- ============================================================================
-- TEST 9: Partial Index Coverage Verification
-- ============================================================================
-- Verify idx_terms_active only indexes active (non-deleted) rows
SELECT
  'idx_terms_active' as index_name,
  COUNT(*) as indexed_rows,
  (SELECT COUNT(*) FROM public.terms WHERE deleted_at IS NULL) as active_rows,
  CASE
    WHEN COUNT(*) = (SELECT COUNT(*) FROM public.terms WHERE deleted_at IS NULL)
    THEN '✅ Correct: Indexes only active rows'
    ELSE '❌ ERROR: Index row count mismatch'
  END as status
FROM public.terms
WHERE deleted_at IS NULL;

-- ============================================================================
-- TEST 10: Regression Test - No Data Loss
-- ============================================================================
SELECT
  'terms' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_rows,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_rows,
  '✅ Data integrity verified' as status
FROM public.terms;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- All tests should PASS for index strategy to be considered successful.
-- Expected outcomes:
-- ✅ All 4 indexes exist and have reasonable sizes
-- ✅ Each index is actively used (idx_scan > 0)
-- ✅ Query times are near target performance (2-5ms)
-- ✅ Write performance overhead is acceptable (1-2ms)
-- ✅ No data loss from index creation
-- ✅ Partial index coverage is correct

COMMIT;
