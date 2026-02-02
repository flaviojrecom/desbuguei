# Database Migrations Guide

## Overview
This directory contains all database migrations for the Desbuquei project. Migrations are versioned SQL files that track schema changes and are reversible.

## Migration Strategy
- **Version Control:** All migrations committed to git
- **Rollback:** Explicit rollback scripts provided for each migration
- **Idempotency:** All migrations use `IF NOT EXISTS` to be safe to retry
- **Snapshots:** Before/after snapshots capture schema state
- **Testing:** All migrations tested before deployment

## Migration Files

### 001_create_terms_table.sql
- **Purpose:** Create the `terms` table for storing technical glossary entries
- **Tables Created:** `public.terms`
- **Columns:**
  - `id` (UUID PRIMARY KEY)
  - `term` (VARCHAR, UNIQUE)
  - `fullTerm` (VARCHAR)
  - `category` (VARCHAR with CHECK constraint)
  - `definition`, `phonetic`, `slang`, `translation` (TEXT)
  - `examples`, `analogies`, `relatedTerms` (JSONB)
  - `created_at`, `updated_at`, `deleted_at` (TIMESTAMP)
- **Indexes:** term, category, created_at, deleted_at
- **Triggers:** Automatic `updated_at` updates
- **Constraints:** Category validation, JSON type validation

## Running Migrations

### Apply a Migration
```bash
# Using Supabase CLI
supabase db pull  # Sync with remote

# Or manually execute SQL
psql -h localhost -U postgres -d desbuquei -f supabase/migrations/001_create_terms_table.sql
```

### Test Migration (Dry Run)
```bash
# Create a backup first
pg_dump -h localhost -U postgres desbuquei > backup.sql

# Test the migration
psql -h localhost -U postgres -d desbuquei -f supabase/migrations/001_create_terms_table.sql

# Verify success, then restore if needed
psql -h localhost -U postgres -d desbuquei -f backup.sql
```

### Rollback a Migration
```bash
# Execute rollback script
psql -h localhost -U postgres -d desbuquei -f supabase/migrations/001_rollback.sql

# Verify rollback
\dt public.terms
```

## Creating New Migrations

1. **Create migration file** with format: `NNN_description.sql`
   ```bash
   touch supabase/migrations/002_add_search_index.sql
   ```

2. **Write idempotent SQL:**
   ```sql
   -- Use IF NOT EXISTS for safety
   CREATE TABLE IF NOT EXISTS ...
   CREATE INDEX IF NOT EXISTS ...
   
   -- Always add rollback script
   ```

3. **Create rollback script:** `NNN_rollback.sql`
   ```bash
   touch supabase/migrations/002_rollback.sql
   ```

4. **Test locally** before committing
   ```bash
   # Backup
   pg_dump ... > backup.sql
   
   # Test forward
   psql ... -f supabase/migrations/002_*.sql
   
   # Test rollback
   psql ... -f supabase/migrations/002_rollback.sql
   ```

5. **Commit to git**
   ```bash
   git add supabase/migrations/002_*
   git commit -m "feat: add search index migration"
   ```

## Best Practices

✅ **DO:**
- Always create rollback scripts
- Use `IF NOT EXISTS` for idempotency
- Test migrations on local database first
- Create snapshots before/after migrations
- Document what the migration does
- Use meaningful migration names
- Keep migrations focused on one change
- Validate with CodeRabbit before deployment

❌ **DON'T:**
- Modify migrations after they're applied
- Use ORM-generated migrations directly
- Skip testing on local database
- Create new migration for simple fixes (use next migration)
- Drop tables without understanding implications
- Leave destructive operations without safeguards
- Run migrations manually in production without backup

## Monitoring

Check migration status:
```sql
-- List all tables
\dt public.*

-- Check table structure
\d public.terms

-- List indexes
\di

-- Check triggers
SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';
```

## Support

For questions about migrations:
1. Review this README
2. Check Supabase documentation: https://supabase.com/docs/guides/cli/managing-migrations
3. Consult with @data-engineer (Dara)
