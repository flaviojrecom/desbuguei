# Database Migrations

This directory contains version-controlled SQL migrations for Desbuquei database schema.

## Migration Strategy

- **Format**: Pure SQL (no ORM-generated migrations)
- **Naming**: `NNN_description.sql` (e.g., `001_create_terms_table.sql`)
- **Idempotency**: All migrations use `IF NOT EXISTS` for safe re-runs
- **Rollback**: Explicit `NNN_rollback.sql` script for each migration
- **Snapshots**: Schema snapshots in `../snapshots/` for verification

## Migration 001: Create Terms Table

**File**: `001_create_terms_table.sql`

**What it does**:
- Creates PostgreSQL ENUM type `category_type` with 6 allowed values
- Creates main `public.terms` table with 20 columns
- Adds 4 supporting indexes for common query patterns
- Includes comprehensive comments and documentation
- Implements soft deletes via `deleted_at` column

**Schema**:

```
public.terms {
  id (UUID, PRIMARY KEY)
  term (VARCHAR, UNIQUE, NOT NULL)
  fullTerm (VARCHAR)
  category (category_type, NOT NULL)
  definition (TEXT, NOT NULL)
  phonetic (VARCHAR)
  slang (TEXT, nullable)
  translation (TEXT, NOT NULL)
  examples (JSONB array, NOT NULL)
  analogies (JSONB array, NOT NULL)
  practicalUsage (JSONB object)
  relatedTerms (JSONB array)
  created_at (TIMESTAMP, immutable)
  updated_at (TIMESTAMP, mutable)
  deleted_at (TIMESTAMP, nullable - soft deletes)
}
```

**Quality assurance**:
- ✅ Data integrity: NOT NULL, CHECK, UNIQUE constraints
- ✅ Type safety: ENUM for categories, JSONB validation
- ✅ Performance: 4 indexes for common access patterns
- ✅ Safety: Soft deletes with filtered indexes
- ✅ Audit trail: created_at, updated_at, deleted_at
- ✅ Documentation: Comprehensive COMMENT ON statements
- ✅ Idempotency: `IF NOT EXISTS` for safe re-runs
- ✅ Transaction safety: Wrapped in BEGIN/COMMIT

**Indexes**:

| Index Name | Purpose | Covers |
|-----------|---------|--------|
| `idx_terms_category_created` | Category filtering + newest-first sorting | category, created_at (DESC), deleted_at |
| `idx_terms_active` | Active-only queries (soft delete pattern) | deleted_at |
| `idx_terms_term_gin` | Full-text search in Portuguese | term + definition (GIN tsvector) |
| `idx_terms_related_terms_gin` | Efficient JSONB containment queries | relatedTerms array |

**Constraints**:

| Constraint | Validates | Rationale |
|-----------|-----------|-----------|
| UNIQUE(term) | No duplicate terms | Business requirement |
| NOT NULL(term, definition, translation, examples, analogies) | Required fields present | Data integrity |
| CHECK(term != '') | Non-empty term | Prevent blank entries |
| CHECK(definition != '') | Non-empty definition | Require meaningful content |
| CHECK(translation != '') | Non-empty translation | Portuguese translation required |
| CHECK(jsonb_typeof(examples) = 'array') | Examples is valid array | Structural integrity |
| CHECK(jsonb_typeof(analogies) = 'array') | Analogies is valid array | Structural integrity |
| CHECK(jsonb_typeof(relatedTerms) = 'array') | RelatedTerms is valid array | Structural integrity |

## Rollback 001: Drop Terms Table

**File**: `001_rollback.sql`

**What it does**:
- Drops all supporting indexes
- Drops `public.terms` table
- Drops `category_type` ENUM
- Verifies successful rollback

**Safety features**:
- ✅ Pre-flight check: Verifies table exists before drop
- ✅ Schema validation: Checks for expected column structure
- ✅ Post-flight check: Confirms table was dropped successfully
- ✅ Transaction safety: Wrapped in BEGIN/COMMIT

## How to Apply Migrations

### Prerequisites

```bash
# Set environment variables
export SUPABASE_DB_URL="postgresql://user:password@db.supabase.co:5432/postgres"
```

### Apply migration

```bash
# Test first (dry-run)
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql --dry-run

# Apply migration
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql

# Verify success
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='terms'"
# Output: count = 1 (if successful)
```

### Rollback (if needed)

```bash
# Test rollback first
psql $SUPABASE_DB_URL -f supabase/migrations/001_rollback.sql --dry-run

# Execute rollback
psql $SUPABASE_DB_URL -f supabase/migrations/001_rollback.sql

# Verify rollback
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='terms'"
# Output: count = 0 (if successful)
```

## Schema Snapshots

Before and after snapshots help verify migration success:

```bash
# Before migration (baseline)
pg_dump --schema-only $SUPABASE_DB_URL > snapshots/db-snapshot-001-before.sql

# After migration (for verification)
pg_dump --schema-only $SUPABASE_DB_URL > snapshots/db-snapshot-001-after.sql

# Compare
diff snapshots/db-snapshot-001-before.sql snapshots/db-snapshot-001-after.sql
```

## Testing

### Unit test migration idempotency

```bash
# Apply twice (should succeed both times)
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql
# Both should complete without errors (IF NOT EXISTS ensures this)
```

### Test rollback + re-apply

```bash
# Apply
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql

# Rollback
psql $SUPABASE_DB_URL -f supabase/migrations/001_rollback.sql

# Re-apply (should succeed, proving reversibility)
psql $SUPABASE_DB_URL -f supabase/migrations/001_create_terms_table.sql
```

### Verify schema correctness

```bash
# Count tables
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"
# Should output: 1

# Count columns
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='terms'"
# Should output: 20

# Count indexes
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema='public' AND table_name='terms' AND indexname LIKE 'idx_%'"
# Should output: 4

# Verify ENUM type
psql $SUPABASE_DB_URL -c "SELECT enum_range(NULL::category_type)"
# Should list: 6 category values
```

## Best Practices

1. **Always test before deploying**: Use `--dry-run` or test database first
2. **Create snapshot before migration**: Baseline for comparison
3. **Test rollback**: Ensure 001_rollback.sql works as expected
4. **Document changes**: Keep migration notes in comments
5. **Version control**: Commit both migration and rollback together
6. **Never modify migrations**: If wrong, create new migration to fix
7. **Use transactions**: Wrap changes in BEGIN/COMMIT
8. **Check constraints**: Validate data integrity at DB level

## Future Migrations

When adding new migrations:

1. Create `NNN_description.sql` in this directory
2. Create `NNN_rollback.sql` with reversal logic
3. Create `db-snapshot-NNN-before.sql` baseline
4. Add documentation to this README
5. Commit all three files together
6. Test on dev database first, then staging, then production

## Phase 2-3 Planned Migrations

- **TD-201**: RLS Policies (Add security policies)
- **TD-202**: Query Indexes (Optimize access patterns)
- **TD-203**: Additional tables (User data, favorites history)

---

**Last updated**: 2026-02-02
**Status**: Phase 1 Foundation
**Next review**: Before phase 2 RLS implementation
