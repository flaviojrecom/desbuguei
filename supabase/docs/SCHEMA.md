# Database Schema - Desbuquei

## Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│           public.terms                  │
├─────────────────────────────────────────┤
│ PK  id (UUID)                           │
│     term (VARCHAR) UNIQUE               │
│     fullTerm (VARCHAR)                  │
│     category (VARCHAR) CHECK            │
│     definition (TEXT)                   │
│     phonetic (VARCHAR)                  │
│     slang (VARCHAR)                     │
│     translation (VARCHAR)               │
│     examples (JSONB[])                  │
│     analogies (JSONB[])                 │
│     relatedTerms (JSONB[])              │
│     created_at (TIMESTAMP)              │
│     updated_at (TIMESTAMP)              │
│     deleted_at (TIMESTAMP)              │
└─────────────────────────────────────────┘
     ↓
  Indexes:
  - idx_terms_term
  - idx_terms_category
  - idx_terms_created_at
  - idx_terms_deleted_at
```

## Table Details

### public.terms
**Purpose:** Store technical glossary entries with multilingual support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| term | VARCHAR(255) | NOT NULL, UNIQUE | The term (e.g., "API") |
| fullTerm | VARCHAR(255) | | Full English expansion |
| category | VARCHAR(100) | NOT NULL, CHECK IN (...) | Category classification |
| definition | TEXT | | Portuguese business definition |
| phonetic | VARCHAR(255) | | Pronunciation hint |
| slang | VARCHAR(255) | | Common abbreviation |
| translation | VARCHAR(255) | | Portuguese translation |
| examples | JSONB | NOT NULL, DEFAULT '[]' | Business use examples (JSON array) |
| analogies | JSONB | NOT NULL, DEFAULT '[]' | Simple analogies (JSON array) |
| relatedTerms | JSONB | DEFAULT '[]' | Related terms (JSON array) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update (auto-updated) |
| deleted_at | TIMESTAMP | | Soft delete timestamp |

## Category Enum Values
- `Desenvolvimento` - Software development
- `Infraestrutura` - Infrastructure & DevOps
- `Dados & IA` - Data science & AI
- `Segurança` - Security & compliance
- `Agile & Produto` - Agile & product management

## Indexes Strategy

| Index | Purpose |
|-------|---------|
| idx_terms_term | Search by term name (primary lookup) |
| idx_terms_category | Filter by category |
| idx_terms_created_at | Sort by creation date |
| idx_terms_deleted_at | Query soft-deleted records |

## Triggers

### trigger_terms_updated_at
- **Event:** BEFORE UPDATE on public.terms
- **Action:** Automatically sets `updated_at = NOW()`
- **Purpose:** Track when records were last modified

## Constraints

### CHECK Constraints
1. **check_category:** Validates category is one of 5 allowed values
2. **check_examples:** Validates examples is a JSON array
3. **check_analogies:** Validates analogies is a JSON array
4. **check_relatedTerms:** Validates relatedTerms is a JSON array

## Future Considerations

### Phase 2: RLS (Row Level Security)
```sql
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

-- Allow public read-only access
CREATE POLICY "Public read" ON public.terms
  FOR SELECT USING (deleted_at IS NULL);

-- Allow admin write access
CREATE POLICY "Admin write" ON public.terms
  FOR ALL USING (auth.role() = 'admin');
```

### Phase 3: Audit Triggers
```sql
-- Create audit table
CREATE TABLE public.terms_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terms_id UUID REFERENCES public.terms,
  action TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Create audit trigger
CREATE TRIGGER audit_terms AFTER UPDATE ON public.terms
  FOR EACH ROW EXECUTE FUNCTION audit_terms();
```

## Access Patterns

### Common Queries
```sql
-- Find term by name
SELECT * FROM terms WHERE term = 'API' AND deleted_at IS NULL;

-- List all terms in category
SELECT term, definition FROM terms 
  WHERE category = 'Desenvolvimento' AND deleted_at IS NULL
  ORDER BY created_at DESC;

-- Search by term prefix
SELECT * FROM terms WHERE term ILIKE 'Docker%' AND deleted_at IS NULL;

-- Get recently updated terms
SELECT * FROM terms 
  WHERE updated_at > NOW() - INTERVAL '7 days'
  ORDER BY updated_at DESC;
```

## Backup & Recovery

### Full Database Backup
```bash
pg_dump -h localhost -U postgres desbuquei > backup.sql
```

### Table-Specific Backup
```bash
pg_dump -h localhost -U postgres desbuquei -t public.terms > terms_backup.sql
```

### Restore from Backup
```bash
psql -h localhost -U postgres desbuquei < backup.sql
```

---

**Last Updated:** 2026-02-02
**Schema Version:** 001
**Status:** Production Ready
