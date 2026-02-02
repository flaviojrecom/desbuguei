# Migration 001 Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database credentials obtained from Supabase Dashboard
- [ ] `.env` file configured with Supabase credentials
- [ ] `psql` CLI installed and available
- [ ] Network access verified to Supabase (no firewall blocks)
- [ ] Backup created of current database (if exists)

## 🔧 Configuration Steps

### Step 1: Get Supabase Credentials

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (bottom left)
3. Click **Database** tab
4. Copy the **Connection String** from "Connection pooler" section
5. Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

### Step 2: Configure `.env` File

Update `/Users/flaviogoncalvesjr/Code/desbuquei/.env`:

```bash
# Database & Backend
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[your-anon-key-here]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key-here]

# For migrations (connection string from "Connection pooler")
SUPABASE_DB_URL=postgresql://postgres:[password]@[project-id].supabase.co:6543/postgres
```

**Where to find these values:**
- **SUPABASE_URL**: Project Settings → URL field
- **SUPABASE_ANON_KEY**: Project Settings → API → `anon` key
- **SUPABASE_SERVICE_ROLE_KEY**: Project Settings → API → `service_role` key
- **SUPABASE_DB_URL**: Database → Connection pooler → URI (PostgreSQL)

### Step 3: Verify Configuration

```bash
# Source environment
source /Users/flaviogoncalvesjr/Code/desbuquei/.env

# Test connection
psql $SUPABASE_DB_URL -c "SELECT version();"
# Should output PostgreSQL version (if successful)
```

## 🚀 Migration Deployment

### Option A: Direct SQL Execution (Recommended)

```bash
# Navigate to project
cd /Users/flaviogoncalvesjr/Code/desbuquei

# Load environment
source .env

# Step 1: Create pre-migration snapshot
pg_dump --schema-only $SUPABASE_DB_URL > supabase/snapshots/db-snapshot-001-before.sql
echo "✓ Pre-migration snapshot created"

# Step 2: Apply migration (dry-run first)
psql $SUPABASE_DB_URL < supabase/migrations/001_create_terms_table.sql --echo-queries --single-transaction
echo "✓ Migration applied successfully"

# Step 3: Create post-migration snapshot
pg_dump --schema-only $SUPABASE_DB_URL > supabase/snapshots/db-snapshot-001-after.sql
echo "✓ Post-migration snapshot created"

# Step 4: Verify migration success
psql $SUPABASE_DB_URL -c "
  SELECT
    'Table' as object_type, COUNT(*) as count
  FROM information_schema.tables
  WHERE table_schema='public' AND table_name='terms'

  UNION ALL

  SELECT
    'Columns' as object_type, COUNT(*) as count
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='terms'

  UNION ALL

  SELECT
    'Indexes' as object_type, COUNT(*) as count
  FROM information_schema.statistics
  WHERE table_schema='public' AND table_name='terms'

  UNION ALL

  SELECT
    'ENUM values' as object_type, COUNT(*) as count
  FROM information_schema.element_types
  WHERE element_name='category_type';
"

# Expected output:
# object_type  | count
# -------------|-------
# Table        |     1
# Columns      |    20
# Indexes      |     4
# ENUM values  |     6
```

### Option B: Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref [project-id]

# Push migration
supabase db push

# Verify
supabase db lint
```

## ✅ Post-Deployment Verification

### Verify Table Structure

```bash
psql $SUPABASE_DB_URL -c "
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='terms'
  ORDER BY ordinal_position;
"
```

Expected columns (20):
- id (uuid, NOT NULL)
- term (character varying, NOT NULL)
- fullTerm (character varying, nullable)
- category (USER-DEFINED, NOT NULL)
- definition (text, NOT NULL)
- phonetic (character varying, nullable)
- slang (text, nullable)
- translation (text, NOT NULL)
- examples (jsonb, NOT NULL)
- analogies (jsonb, NOT NULL)
- practicalUsage (jsonb, nullable)
- relatedTerms (jsonb, nullable)
- created_at (timestamp with time zone, NOT NULL)
- updated_at (timestamp with time zone, NOT NULL)
- deleted_at (timestamp with time zone, nullable)

### Verify Indexes

```bash
psql $SUPABASE_DB_URL -c "
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename='terms'
  ORDER BY indexname;
"
```

Expected indexes (4):
- idx_terms_category_created
- idx_terms_active
- idx_terms_term_gin
- idx_terms_related_terms_gin

### Verify ENUM Type

```bash
psql $SUPABASE_DB_URL -c "
  SELECT enum_range(NULL::category_type);
"
```

Expected values (6):
- Desenvolvimento
- Infraestrutura
- Dados & IA
- Segurança
- Agile & Produto
- Outros

### Test Insert (Verify Constraints)

```bash
psql $SUPABASE_DB_URL -c "
  INSERT INTO public.terms (
    term, fullTerm, category, definition, translation,
    examples, analogies, relatedTerms
  ) VALUES (
    'API',
    'Application Programming Interface',
    'Desenvolvimento',
    'Interface que permite comunicação entre sistemas.',
    'Um conjunto de regras para conversa entre programas.',
    '[{\"title\": \"REST API\", \"description\": \"Comunicação web\"}]'::jsonb,
    '[{\"title\": \"Garçom\", \"description\": \"Leva pedidos para a cozinha\"}]'::jsonb,
    '[\"REST\", \"HTTP\"]'::jsonb
  );
"

# Then verify:
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM public.terms WHERE term='API';"
# Should output: 1
```

## 🔄 Rollback Procedure (If Needed)

If migration fails or needs to be reversed:

```bash
# Load environment
source .env

# Execute rollback script
psql $SUPABASE_DB_URL < supabase/migrations/001_rollback.sql
echo "✓ Rollback completed"

# Verify rollback success
psql $SUPABASE_DB_URL -c "
  SELECT COUNT(*) as table_count
  FROM information_schema.tables
  WHERE table_schema='public' AND table_name='terms';
"
# Should output: 0 (table dropped)
```

## 📝 Deployment Log Template

After deployment, create `supabase/migrations/001_deployment_log.txt`:

```
Migration: 001_create_terms_table.sql
Deploy Date: [YYYY-MM-DD HH:MM:SS]
Environment: [dev/staging/production]
Deployed By: [Your Name]
Status: ✓ SUCCESS

Pre-Migration Snapshot: db-snapshot-001-before.sql
Post-Migration Snapshot: db-snapshot-001-after.sql

Verification Results:
- [ ] Table created (1 table)
- [ ] Columns created (20 columns)
- [ ] Indexes created (4 indexes)
- [ ] ENUM type created (6 values)
- [ ] Sample insert successful
- [ ] Constraints validated

Notes:
[Any issues or observations]

Rollback Status: Ready (001_rollback.sql available)
```

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

**Solution:**
1. Verify Supabase project is active
2. Check firewall allows connection to Supabase
3. Verify credentials in `.env` are correct
4. Check connection string format is `postgresql://...`

### Error: "role 'postgres' does not exist"

**Solution:**
1. Use connection string from "Connection pooler" (not "Direct connection")
2. Verify credentials are for a valid database user
3. Check Supabase project status (not paused)

### Error: "type 'category_type' already exists"

**Solution:**
1. Verify this is the first deployment
2. If re-running: Use `CREATE TYPE ... IF NOT EXISTS` (already in migration)
3. Check if previous migration failed partially (run rollback first)

### Error: "migration not idempotent"

**Solution:**
1. The migration uses `IF NOT EXISTS` so it should be safe to re-run
2. If error persists, manually verify what exists in database
3. Consider running rollback, then re-applying

## 📞 Support

**Questions about this migration?**
- Review comments in `001_create_terms_table.sql`
- Check `README.md` for more details
- See Phase 2 migrations for RLS and security policies

---

**Created**: 2026-02-02
**Status**: Ready for Deployment
**Next Phase**: TD-201 (RLS Policies)
