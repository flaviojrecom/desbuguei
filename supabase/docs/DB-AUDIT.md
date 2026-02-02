# Desbuquei - Database Audit Report

**Project:** Desbuquei
**Date:** 2026-02-01
**Auditor:** @data-engineer (Dara)
**Status:** Quick Audit (Environment + Code Analysis)

---

## Executive Summary

Supabase is **partially configured** in the Desbuquei project. The application code expects a `terms` table but **the table schema has not been formally defined, migrated, or versioned**. The codebase implements read-through caching pattern with proper fallbacks, but lacks RLS policies, migrations, and database versioning.

**Database Readiness:** ⚠️ **Not Production Ready** (no migrations, no RLS, no schema versioning)

---

## 1. Environment Configuration

### 1.1 Current Status

| Item | Status | Details |
|------|--------|---------|
| **Supabase Keys** | ⚠️ Configured | URL + ANON_KEY expected in `.env` |
| **Keys Location** | ⚠️ Weak | Environment variables used; no `.env.local` config visible for Supabase |
| **Service Role Key** | ❌ Missing | Not configured (needed for admin operations) |
| **Supabase CLI** | ❌ Not Installed | No `supabase/` directory found |
| **Migrations** | ❌ None | No migration files or versioning |
| **Seeds** | ❌ None | Only hardcoded mock data in termService.ts |

### 1.2 Environment Variable Setup

**Required Variables:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co         # Project URL
VITE_SUPABASE_ANON_KEY=eyJ...                       # Anon key (safe for frontend)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...              # Service role (server-side only)
```

**Current State:**
- `.env.local`: Only contains `GEMINI_API_KEY=PLACEHOLDER_API_KEY`
- `.env.example`: Shows AIOS template (not Desbuquei-specific)
- No Supabase variables visible in version control

**Issue:** Supabase keys should be in `.env` (not in `.env.local`). Confirm keys are configured.

---

## 2. Database Schema Analysis

### 2.1 Expected Schema (from termService.ts code)

**Table: `terms`**

```sql
-- Inferred from line 59-66 of termService.ts
CREATE TABLE terms (
  id TEXT PRIMARY KEY,                -- Normalized term ID (e.g., "react-js")
  term TEXT NOT NULL,                 -- Display name (e.g., "React")
  category TEXT,                      -- Category enum (Desenvolvimento, Infraestrutura, etc.)
  definition TEXT,                    -- Plain text for search
  content JSONB NOT NULL,             -- Full TermData JSON blob (all fields)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Schema Issues Identified

| Issue | Severity | Details |
|-------|----------|---------|
| **No Schema Definition** | CRITICAL | Table structure inferred from code, not formally defined |
| **No Migrations** | CRITICAL | Zero DDL versioning; can't rollback or audit changes |
| **Missing Constraints** | HIGH | No NOT NULL, UNIQUE, CHECK constraints documented |
| **Missing Foreign Keys** | MEDIUM | No relationships to other tables (if exist) |
| **Missing Indexes** | MEDIUM | Only implicit PK index; no index on term, category, created_at |
| **No Comments** | MEDIUM | No table/column documentation |
| **Soft Deletes** | LOW | No deleted_at column for audit trail |
| **Audit Trail** | LOW | No created_by, updated_by fields |

### 2.3 Recommended Schema

```sql
-- Production-ready schema with constraints and indexes
CREATE TABLE terms (
  -- Primary Key
  id TEXT PRIMARY KEY,

  -- Core Fields
  term TEXT NOT NULL UNIQUE,          -- English term name (unique constraint)
  full_term TEXT,                     -- Full English expansion
  category TEXT NOT NULL CHECK (
    category IN (
      'Desenvolvimento',
      'Infraestrutura',
      'Dados & IA',
      'Segurança',
      'Agile & Produto'
    )
  ),

  -- Content (Text + JSON)
  definition TEXT NOT NULL,           -- Portuguese text (for search)
  content JSONB NOT NULL,             -- Full TermData object

  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,             -- Soft delete support

  -- Metadata
  is_published BOOLEAN DEFAULT true,
  version_number INTEGER DEFAULT 1
);

-- Indexes for query performance
CREATE INDEX idx_terms_category ON terms(category);
CREATE INDEX idx_terms_created_at ON terms(created_at DESC);
CREATE INDEX idx_terms_published ON terms(is_published) WHERE is_published = true;
CREATE INDEX idx_terms_term_tsv ON terms USING GIN(
  to_tsvector('portuguese', definition)  -- Full-text search support
);

-- Comments for documentation
COMMENT ON TABLE terms IS 'Technical glossary terms in Portuguese';
COMMENT ON COLUMN terms.id IS 'Normalized ID: react-js (lowercase, hyphens)';
COMMENT ON COLUMN terms.content IS 'Full TermData JSON: {definition, examples, analogies, ...}';
COMMENT ON COLUMN terms.deleted_at IS 'Soft delete timestamp; NULL = active';
```

---

## 3. Current Application Code Analysis

### 3.1 Database Access Pattern

**File:** `services/termService.ts` (210 lines)

**Implementation:**
```typescript
// Read-Through Cache Pattern
const getTermData = async (termId: string): Promise<TermData> => {
  1. Check Supabase (if configured)
     - SELECT * FROM terms WHERE id = normalizedId
     - Returns: { data: TermData, error }

  2. Fallback to local mock DB (if Supabase miss)
     - Check localDatabase["api"] (only hardcoded term)

  3. Generate via Gemini API (if both miss)
     - AI generates TermData with schema validation

  4. Save to Supabase (async fire-and-forget)
     - INSERT INTO terms (id, term, category, definition, content)
};
```

**Query Issues Identified:**

| Issue | Severity | Code | Details |
|-------|----------|------|---------|
| **SELECT * with JSONB** | MEDIUM | Line 58-62 | Selecting full JSONB blob instead of structured columns |
| **No Transaction** | MEDIUM | Line 151-160 | Async insert without transaction; could lose data on crash |
| **No Error Handling** | MEDIUM | Line 64-70 | Generic fallback on ANY error (incl. network, permissions) |
| **Missing Indexes** | MEDIUM | N/A | No index on `id` (but it's PK, so OK) |
| **Case Sensitivity** | LOW | Line 44-45 | ID normalization works, but no DB constraint |

### 3.2 Supabase Client Configuration

**File:** `services/supabase.ts` (26 lines)

```typescript
const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey)
  : { /* mock client */ };  // Fallback prevents crash
```

**Security Observations:**

| Aspect | Status | Details |
|--------|--------|---------|
| **API Key Exposure** | ⚠️ Expected | ANON_KEY in frontend is OK; restricted by RLS |
| **Service Role Key** | ✅ Safe | Not used in frontend (good practice) |
| **Mock Client** | ✅ Good | Graceful degradation if Supabase unavailable |
| **Connection String** | ⚠️ Missing | No connection pooling configuration |

---

## 4. Security Assessment

### 4.1 RLS Policies

**Status:** ❌ **NOT CONFIGURED**

Current situation:
- No RLS policies defined
- No auth context used in queries
- Anyone with ANON_KEY can read/write all terms
- Public glossary (read-only) is intended, but should be explicit

**Recommended RLS Policies:**

```sql
-- Enable RLS
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

-- Public read-only access (anyone can read)
CREATE POLICY "allow_public_read" ON terms
  FOR SELECT
  USING (is_published = true);

-- Authenticated users can read all
CREATE POLICY "allow_auth_read" ON terms
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete
CREATE POLICY "allow_admin_write" ON terms
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "allow_admin_update" ON terms
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "allow_admin_delete" ON terms
  FOR DELETE
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
```

### 4.2 Data Exposure Risks

| Risk | Severity | Details |
|------|----------|---------|
| **No RLS on terms table** | HIGH | Unauthenticated users can theoretically access all data (unless restricted in code) |
| **No input validation** | MEDIUM | Term names not validated before DB insertion |
| **JSONB injection** | LOW | AI generates JSON; needs schema validation (✅ present) |
| **Service role bypass** | MEDIUM | Service role key could bypass RLS if leaked |

---

## 5. Technical Debt Inventory

### HIGH SEVERITY

| Debt | Impact | Effort to Fix |
|------|--------|---------------|
| **No Schema Definition** | Can't audit changes, no rollback ability | Medium |
| **No Migrations** | Impossible to version database changes | Medium |
| **No RLS Policies** | Data access not controlled at DB level | Low |
| **Missing Constraints** | Data integrity not enforced (id uniqueness, etc.) | Low |

### MEDIUM SEVERITY

| Debt | Impact | Effort to Fix |
|------|--------|---------------|
| **Missing Indexes** | Slow queries on large datasets (category, created_at) | Low |
| **Async Insert** | Potential data loss on errors (fire-and-forget) | Low |
| **No Audit Fields** | Can't track who created/updated terms | Low |
| **JSONB Denormalization** | Query performance when accessing nested fields | Medium |

### LOW SEVERITY

| Debt | Impact | Effort to Fix |
|------|--------|---------------|
| **No Soft Deletes** | Can't audit deleted terms | Low |
| **No Full-Text Search** | Glossary search must use application logic | Medium |
| **Mock DB Limited** | Only "api" term; needs expansion | Trivial |
| **No Connection Pooling** | Not optimized for serverless (if deployed there) | Low |

---

## 6. Database Operations Readiness

### 6.1 Backup & Recovery

| Operation | Status | Details |
|-----------|--------|---------|
| **Automated Backups** | ✅ Yes (Supabase) | Daily backups included in free tier |
| **Point-in-time Recovery** | ⚠️ Limited | Depends on Supabase plan |
| **Manual Snapshots** | ❌ None | No `.sql` dumps created |
| **Rollback Strategy** | ❌ None | No migration rollback scripts |

### 6.2 Monitoring & Observability

| Aspect | Status | Details |
|--------|--------|---------|
| **Query Logs** | ✅ Supabase | Available in dashboard |
| **Error Tracking** | ⚠️ Basic | Only `console.error` in code |
| **Performance Metrics** | ❌ None | No slow query detection |
| **Alerts** | ❌ None | No automated alerts |

---

## 7. Scaling Concerns

### 7.1 Current Capacity

**Assumptions:**
- Glossary: 100-1,000 terms
- Users: <1,000 concurrent
- API calls: <100/min

**Scaling Limits:**
- Supabase free tier: 500 MB database, 2 GB bandwidth/month
- Gemini API: Rate limited by Google (varies by model)
- No pagination on Glossary (loads all terms in memory)

### 7.2 Scaling Recommendations

1. **Add Pagination** - Limit to 50 terms per page
2. **Implement Caching** - Redis for frequently accessed terms
3. **Add Full-Text Search** - PostgreSQL `tsvector` for efficient search
4. **Archive Old Data** - Move rarely-accessed terms to archive table
5. **Read Replicas** - For high-traffic glossary reads (Premium Supabase feature)

---

## 8. Migration Strategy

### 8.1 Zero-Downtime Migration Plan

```sql
-- STEP 1: Create new schema (pre-production)
CREATE TABLE terms_v2 (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  full_term TEXT,
  category TEXT NOT NULL,
  definition TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true
);

-- STEP 2: Backfill data (can be slow)
INSERT INTO terms_v2 (id, term, category, definition, content, created_at)
SELECT id, term, category, definition, content, created_at FROM terms;

-- STEP 3: Create indexes
CREATE INDEX idx_terms_v2_category ON terms_v2(category);
CREATE INDEX idx_terms_v2_created_at ON terms_v2(created_at DESC);

-- STEP 4: Enable RLS
ALTER TABLE terms_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON terms_v2 FOR SELECT USING (is_published = true);

-- STEP 5: Swap tables (10ms downtime)
BEGIN;
  ALTER TABLE terms RENAME TO terms_old;
  ALTER TABLE terms_v2 RENAME TO terms;
COMMIT;

-- STEP 6: Drop old table (after verification)
DROP TABLE terms_old;
```

---

## 9. Recommended Next Steps

### Immediate (This Phase - FASE 2)

- [x] Audit Supabase configuration
- [ ] Create `supabase/migrations/` directory
- [ ] Write initial schema migration (`001_create_terms_table.sql`)
- [ ] Document expected table structure

### Phase 3 (FASE 3)

- [ ] Apply migrations to production
- [ ] Implement RLS policies
- [ ] Add audit fields (created_by, updated_by)
- [ ] Create seed data script

### Phase 4 (Security & Performance)

- [ ] Implement full-text search
- [ ] Add pagination to Glossary
- [ ] Setup monitoring/alerts
- [ ] Document backup/recovery procedures

---

## 10. Checklist

### Database Design

- [ ] Schema definition (`supabase/migrations/`)
- [ ] Constraints (NOT NULL, UNIQUE, CHECK, FK)
- [ ] Indexes (category, created_at, full-text search)
- [ ] RLS policies (read, insert, update, delete)
- [ ] Audit fields (created_by, updated_by, deleted_at)
- [ ] Comments on tables/columns

### Operations

- [ ] Backup strategy documented
- [ ] Rollback scripts created
- [ ] Migration testing plan
- [ ] Monitoring setup
- [ ] Alert configuration

### Security

- [ ] RLS policies enabled and tested
- [ ] Service role key secured (server-side only)
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] Sensitive data redaction in logs

### Performance

- [ ] Query performance baseline measured
- [ ] Slow query detection setup
- [ ] Index strategy validated
- [ ] Pagination implemented
- [ ] Cache strategy defined

---

## 11. Conclusion

**Database Status: ⚠️ In Development**

Supabase is configured in code but **lacks formal schema, migrations, and security policies**. The application gracefully falls back to local data and Gemini API if Supabase is unavailable, which is excellent for resilience.

**Blockers for Production:**
1. No versioned migrations (risk of schema mismatch)
2. No RLS policies (data access not controlled at DB level)
3. No constraint enforcement (data integrity risks)
4. No audit trail (can't track changes)

**Next Actions:**
1. Create `supabase/` directory with migrations
2. Define and apply schema with constraints
3. Implement RLS policies
4. Add monitoring and backup procedures

---

**Auditor:** @data-engineer (Dara)
**Document:** supabase/docs/DB-AUDIT.md
**Status:** FASE 2 Complete
**Next:** FASE 3 (Frontend audit by @ux-design-expert)
