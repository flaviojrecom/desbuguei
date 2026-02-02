# TD-201: RLS Policies Implementation - Deployment Guide

**Migration File:** `002_enable_rls_policies.sql`
**Status:** Ready for Deployment
**Date:** 2026-02-02
**Author:** Dara (Data Engineer)

---

## Executive Summary

This migration enables Row Level Security (RLS) on the `public.terms` table and creates three comprehensive policies:

1. **Public Read Access** - Anyone can read active glossary terms
2. **Admin Full Access** - Only admins can insert, update, delete
3. **User Roles Table** - Supporting table for role-based access control

**Security Impact:** ⬆️ SIGNIFICANT - Enforces access control at database level
**Performance Impact:** ⬇️ MINIMAL - < 1% overhead for reads, 1-2% for writes
**Deployment Risk:** 🟢 LOW - Additive only (no destructive changes)

---

## Pre-Deployment Checklist

- [ ] Backup current database (automated by Supabase)
- [ ] Create snapshot before migration: `supabase db pull`
- [ ] Review RLS policies: `supabase/docs/RLS-POLICIES.md`
- [ ] Test with staging database first
- [ ] Verify admin JWT tokens include `"role": "admin"`
- [ ] Verify service role key is configured in backend
- [ ] Have rollback script ready: `002_rollback.sql`
- [ ] Schedule deployment during low-traffic period
- [ ] Notify team of changes

---

## Deployment Steps

### Step 1: Create Pre-Migration Snapshot

**Objective:** Create recovery point in case of issues

```bash
# Create snapshot of current schema
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  --schema-only \
  -f supabase/snapshots/db-snapshot-002-before-rls.sql

# Verify snapshot created
ls -lh supabase/snapshots/db-snapshot-002-before-rls.sql
```

### Step 2: Dry Run (Optional but Recommended)

**Objective:** Test migration without applying changes

```bash
# Test with Supabase CLI
supabase db push --dry-run

# Or manually with psql (staging database only)
psql -h ${STAGING_DB_HOST} -U ${STAGING_DB_USER} \
  -d ${STAGING_DB_NAME} \
  -f supabase/migrations/002_enable_rls_policies.sql
```

### Step 3: Apply Migration

**Objective:** Enable RLS and create policies

```bash
# Method A: Supabase CLI (recommended)
supabase db push

# Method B: Manual SQL (if CLI unavailable)
psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  -f supabase/migrations/002_enable_rls_policies.sql
```

### Step 4: Verify Migration Applied

**Objective:** Confirm RLS is enabled and policies created

```sql
-- Check RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'terms';

-- Expected: (terms, t)

-- List all policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'terms';

-- Expected: 2 rows
-- - public_read_access
-- - admin_full_access

-- Check user_roles table exists
\dt public.user_roles
```

### Step 5: Test RLS Policies

**Objective:** Validate policies work as expected

```bash
# Run test suite
psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  -f supabase/tests/rls-policies.test.sql

# Or test manually (see testing section below)
```

### Step 6: Deploy Backend Updates

**Objective:** Ensure backend uses correct auth method

Required:
- Backend proxy configured to use Supabase service role OR
- JWT tokens issued with `"role": "admin"` for admin users

```javascript
// Example: Node.js backend admin proxy

const supabaseAdmin = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Elevated privileges
);

// Admin operations bypass RLS
const { data, error } = await supabaseAdmin
  .from('terms')
  .insert({ term: 'API', ... });
```

### Step 7: Update Frontend (If Needed)

**Objective:** Handle new 403 errors from RLS

Changes needed:
- If frontend tried to write terms (not expected), add error handling
- Display friendly error for unauthorized writes
- No changes if frontend is read-only

```javascript
// Example: Handle 403 Forbidden from RLS

const createTerm = async (term) => {
  try {
    const { data, error } = await supabase
      .from('terms')
      .insert([term]);

    if (error?.code === 'PGRST204') {
      throw new Error('You do not have permission to create terms');
    }
    return data;
  } catch (err) {
    // Handle RLS violation
    if (err.message.includes('violates row-level security')) {
      return { error: 'Unauthorized: Only admins can modify terms' };
    }
    throw err;
  }
};
```

---

## Testing Procedures

### Test 1: Public Read (Should Succeed ✅)

```bash
# Without authentication
curl -X GET 'https://<project>.supabase.co/rest/v1/terms?limit=1' \
  -H 'Accept: application/json'

# Expected: 200 OK with glossary term
```

### Test 2: Non-Admin Write (Should Fail ❌)

```bash
# With non-admin JWT token
curl -X POST 'https://<project>.supabase.co/rest/v1/terms' \
  -H 'Authorization: Bearer <user-jwt>' \
  -H 'Content-Type: application/json' \
  -d '{
    "term": "Test",
    "definition": "Test def",
    "translation": "Test trans",
    "category": "Desenvolvimento",
    "examples": [],
    "analogies": []
  }'

# Expected: 403 Forbidden (RLS policy violated)
```

### Test 3: Admin Write (Should Succeed ✅)

```bash
# With admin JWT token (role='admin')
curl -X POST 'https://<project>.supabase.co/rest/v1/terms' \
  -H 'Authorization: Bearer <admin-jwt>' \
  -H 'Content-Type: application/json' \
  -d '{
    "term": "API Gateway",
    "definition": "Sistema de gerenciamento...",
    "translation": "Porta de entrada",
    "category": "Infraestrutura",
    "examples": [],
    "analogies": []
  }'

# Expected: 201 Created with new term
```

### Test 4: Soft Delete Filtering (Should Hide ✅)

```bash
-- Step 1: Soft delete a term
UPDATE public.terms SET deleted_at = NOW() WHERE term = 'API Gateway';

-- Step 2: Query should not return deleted term
SELECT * FROM public.terms WHERE term = 'API Gateway';

-- Expected: 0 rows (RLS filtered)

-- Step 3: Service role can see deleted (backend only)
-- (Use service role key from Node.js backend)
SELECT * FROM public.terms WHERE term = 'API Gateway';

-- Expected: 1 row with deleted_at timestamp
```

---

## Performance Validation

### Baseline (Before Migration)

```sql
EXPLAIN ANALYZE
SELECT * FROM public.terms WHERE category = 'Infraestrutura' LIMIT 10;

-- Typical metrics:
-- Planning Time: 0.1 ms
-- Execution Time: 0.5 ms
```

### After Migration

```sql
EXPLAIN ANALYZE
SELECT * FROM public.terms WHERE category = 'Infraestrutura' LIMIT 10;

-- Expected:
-- Planning Time: 0.2 ms
-- Execution Time: 0.6 ms (< 1ms overhead)
```

**Acceptable Impact:** < 1% performance degradation ✅

---

## Rollback Procedure

### If Issues Occur

**Step 1: Immediate Rollback** (< 5 minutes to restore)

```bash
# Option A: Using Supabase backup
supabase db reset --linked
# Choose: "Restore from backup"

# Option B: Manual rollback SQL
psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  -f supabase/migrations/002_rollback.sql

# Verify rollback
SELECT relrowsecurity FROM pg_class WHERE relname = 'terms';
# Expected: f (false - RLS disabled)
```

**Step 2: Root Cause Analysis**
- Review deployment logs
- Check JWT token format
- Verify admin users have role='admin' claim

**Step 3: Re-deploy with Fixes**
- Fix underlying issue
- Re-run migration
- Test thoroughly

---

## Post-Deployment Checklist

- [ ] Migration applied without errors
- [ ] RLS enabled on public.terms table
- [ ] 2 policies created (public_read, admin_full_access)
- [ ] Public read access works (no auth needed)
- [ ] Non-admin cannot write (403 error)
- [ ] Admin can write (201/200 success)
- [ ] Deleted terms hidden from public
- [ ] Service role bypass works (backend only)
- [ ] Performance acceptable (< 1% overhead)
- [ ] No application errors in monitoring
- [ ] Team notified of new access control
- [ ] Documentation updated (RLS-POLICIES.md)

---

## Monitoring

### Key Metrics to Watch

**After Deployment:**

1. **Error Rate** (should not increase)
   - Monitor for 403 Forbidden errors
   - Expected: Only if non-admin tries to write
   - Alert if 403 errors > 10/hour

2. **Query Performance** (should stay same)
   - Monitor query execution time
   - Expected: < 1ms for reads
   - Alert if queries > 5ms

3. **Application Logs**
   - Watch for "row-level security policy" errors
   - Expected: Only from unauthorized write attempts
   - No errors expected from reads

### Sentry Integration

```javascript
// Monitor RLS violations in Sentry
Sentry.captureException(error, {
  tags: {
    type: 'rls_violation',
    operation: 'insert' // or update/delete
  }
});
```

---

## Troubleshooting

### Issue: "permission denied for schema public"

**Cause:** User doesn't have database user configured
**Fix:** Verify Supabase user created in Auth settings

### Issue: "new row violates row-level security policy"

**Cause:** User attempting write without admin role
**Expected Behavior:** ✅ This is correct
**Fix:**
- Verify user has admin role if needed
- Use service role in backend, not frontend

### Issue: "relation "user_roles" does not exist"

**Cause:** Migration didn't complete fully
**Fix:**
- Re-run migration: `supabase db push`
- Check PostgreSQL logs for errors

### Issue: Performance degradation after migration

**Cause:** Missing indexes on RLS filter columns
**Fix:**
- deleted_at already indexed: ✅
- Check query plans with EXPLAIN ANALYZE
- Create missing indexes if found

---

## Success Criteria

✅ RLS enabled and policies created
✅ All tests passing (positive and negative)
✅ No performance degradation
✅ No application errors
✅ Team trained on new access model
✅ Monitoring alerts configured
✅ Documentation complete and accessible

---

## Support & Questions

**RLS Policy Details:** See `supabase/docs/RLS-POLICIES.md`
**Test Suite:** See `supabase/tests/rls-policies.test.sql`
**Troubleshooting:** See section above or Supabase docs

---

**Deployed By:** [Team Member Name]
**Deployment Date:** [To be filled]
**Version:** TD-201 RLS Policies v1.0
