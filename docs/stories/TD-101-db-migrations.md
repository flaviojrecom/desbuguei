# Story TD-101: Database Migrations Infrastructure

**Epic:** EPIC-TD-001 (Technical Debt Resolution - Phase 1)
**Status:** 📝 Ready for Dev
**Priority:** P0 - CRITICAL
**Sprint:** Phase 1, Week 1
**Effort:** 16 hours
**Created:** 2026-02-02

---

## 📖 User Story

As a **database engineer**, I want to **establish migration infrastructure** so that **all future schema changes are tracked, reversible, and auditable**.

---

## ✅ Acceptance Criteria

### Migration Infrastructure Setup
- [ ] `supabase/migrations/` directory created with proper structure
- [ ] Migration file `001_create_terms_table.sql` includes:
  - `id` (UUID, PRIMARY KEY)
  - `term` (VARCHAR, NOT NULL, UNIQUE)
  - `category` (VARCHAR, NOT NULL with CHECK constraint)
  - `definition`, `phonetic`, `slang`, `translation` (TEXT fields)
  - `examples`, `analogies` (JSONB with NOT NULL constraint)
  - `relatedTerms` (JSONB array)
  - `created_at`, `updated_at`, `deleted_at` (TIMESTAMP fields)

### Schema Constraints
- [ ] NOT NULL constraints on all required fields
- [ ] CHECK constraints on category (valid values: 'Desenvolvimento', 'Infraestrutura', 'Dados & IA', 'Segurança', 'Agile & Produto')
- [ ] UNIQUE constraint on `term`
- [ ] Default values: `created_at = NOW()`, `updated_at = NOW()`
- [ ] Soft delete support via `deleted_at` column

### Migration Management
- [ ] Migration rollback script (`001_rollback.sql`) tested successfully
- [ ] Migration applied to dev database without errors
- [ ] Schema snapshot captured (`db-snapshot-001.sql`)
- [ ] Migration file naming convention documented

### Documentation
- [ ] `supabase/docs/migrations/README.md` created with procedures
- [ ] Migration workflow documented
- [ ] Schema diagram created
- [ ] Team trained on migration procedure

---

## 🎯 Definition of Done

- [ ] Migration files created and committed to main
- [ ] Rollback scripts tested and verified
- [ ] Schema snapshot created
- [ ] Documentation complete
- [ ] CodeRabbit SQL review passed
- [ ] DBA sign-off obtained
- [ ] Story marked "Ready for Review"

---

## 📋 Tasks

### Task 1: Setup Migration Directory Structure
**Subtasks:**
- [ ] 1.1 Create `supabase/migrations/` directory
- [ ] 1.2 Create `supabase/docs/migrations/` directory
- [ ] 1.3 Create README with migration procedures

### Task 2: Create Terms Table Migration
**Subtasks:**
- [ ] 2.1 Create `001_create_terms_table.sql` with all columns
- [ ] 2.2 Add NOT NULL constraints
- [ ] 2.3 Add CHECK constraints for category
- [ ] 2.4 Add UNIQUE constraint on term
- [ ] 2.5 Test migration syntax

### Task 3: Create Rollback Script
**Subtasks:**
- [ ] 3.1 Create `001_rollback.sql`
- [ ] 3.2 Test rollback procedure
- [ ] 3.3 Document rollback steps

### Task 4: Database Testing
**Subtasks:**
- [ ] 4.1 Apply migration to dev database
- [ ] 4.2 Verify schema created successfully
- [ ] 4.3 Create schema snapshot
- [ ] 4.4 Verify rollback works

### Task 5: Documentation & Quality
**Subtasks:**
- [ ] 5.1 Document migration workflow in README
- [ ] 5.2 Create schema diagram
- [ ] 5.3 Run CodeRabbit SQL review
- [ ] 5.4 Get team sign-off

---

## 🔧 Technical Details

### Standards & Tools
- **Database:** Supabase PostgreSQL
- **File format:** Pure SQL (no ORM-generated migrations)
- **Rollback strategy:** Explicit rollback scripts, snapshot-based recovery
- **Validation:** CodeRabbit SQL review + manual DBA review
- **CLI:** `supabase migration create` for new migrations

### Schema Design
```sql
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term VARCHAR(255) NOT NULL UNIQUE,
  fullTerm VARCHAR(255),
  category VARCHAR(100) NOT NULL CHECK (category IN ('Desenvolvimento', 'Infraestrutura', 'Dados & IA', 'Segurança', 'Agile & Produto')),
  definition TEXT,
  phonetic VARCHAR(255),
  slang VARCHAR(255),
  translation VARCHAR(255),
  examples JSONB NOT NULL DEFAULT '[]',
  analogies JSONB NOT NULL DEFAULT '[]',
  relatedTerms JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Dependencies
- None (Phase 1 blocker)

---

## 🧪 Quality Gates

### Pre-Commit
- [ ] SQL syntax validation
- [ ] Schema review
- [ ] No hardcoded secrets

### Pre-PR
- [ ] CodeRabbit SQL approval
- [ ] Rollback script tested
- [ ] Migration applies cleanly

### Pre-Deploy
- [ ] DBA sign-off
- [ ] Production backup verified
- [ ] Documentation complete

---

## 📚 File List

### Files to Create
- `supabase/migrations/001_create_terms_table.sql` - Main migration
- `supabase/migrations/001_rollback.sql` - Rollback script
- `supabase/docs/migrations/README.md` - Documentation
- `supabase/docs/schema-diagram.md` - Schema visualization
- `supabase/snapshots/db-snapshot-001.sql` - Schema snapshot

### Files to Modify
- None

---

## 📝 Change Log

### Version 1.0 (Draft)
- Story created from STORIES-TECHNICAL-DEBT.md
- All acceptance criteria defined
- Tasks broken down into actionable steps

---

## 🔗 References

- **Supabase Migrations:** https://supabase.com/docs/guides/cli/managing-migrations
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Database Best Practices:** docs/guides/database.md (TBD)

---

## 👤 Agent Model Used

**Assigned To:** @data-engineer (Dara)
**Specialized Agents Needed:**
- @data-engineer (Dara) - Database design and migrations
- @devops (Gage) - Migration deployment

---

## 🧪 Completion Notes

_To be filled by developer after completion_

---

## 📝 Dev Agent Record

### Current Task
Awaiting @data-engineer activation

### Debug Log

---

**Created by:** Gage (DevOps)
**Date:** 2026-02-02
**Last Updated:** 2026-02-02
