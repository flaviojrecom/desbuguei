# Story TD-104: API Authentication & Security - Key Management & Admin Auth

**Epic:** EPIC-TD-001 (Technical Debt Resolution - Phase 1)
**Status:** ✅ Ready for Dev
**Priority:** P0 - CRITICAL
**Sprint:** Phase 1, Week 4
**Effort:** 18 hours
**Created:** 2026-02-02

---

## 📖 User Story

As a **security engineer**, I want to **implement proper API key management and strengthen admin authentication** so that **sensitive credentials are protected from exposure and unauthorized access is prevented**.

---

## ✅ Acceptance Criteria

### API Key Security & Environment Management
- [ ] API keys removed from JavaScript code (zero exposure in dist/)
- [ ] Environment variables properly configured (VITE_* prefixed)
- [ ] Build-time injection working (Vite config validates)
- [ ] Runtime fallback for Gemini API key
- [ ] Supabase keys properly validated at initialization
- [ ] No hardcoded credentials anywhere in codebase

### Admin Authentication & Authorization
- [ ] Admin login form created with proper validation
- [ ] Password stored as bcrypt hash (not plain text)
- [ ] Session management implemented (JWT or secure cookies)
- [ ] Admin pages protected with authentication guards
- [ ] Logout functionality with session cleanup
- [ ] Authentication persists across page reloads (localStorage + validation)
- [ ] Unauthorized access redirects to login

### Gemini API Security
- [ ] API key injection at build time (vite.config.ts)
- [ ] Runtime fallback to local database if key missing
- [ ] No API key visible in browser DevTools/Network tab
- [ ] Error handling for quota exceeded (429) gracefully
- [ ] Rate limiting awareness (log warnings)

### Supabase Authentication
- [ ] Supabase client initialized with proper error handling
- [ ] Connection validation before use
- [ ] Graceful degradation if DB unavailable
- [ ] No service role key exposed in frontend
- [ ] RLS policies enforced (from TD-103)

### Testing & Validation
- [ ] Authentication flow tested (login/logout)
- [ ] Protected routes validated
- [ ] Environment variable injection verified
- [ ] API key exposure check passed (no keys in dist/)
- [ ] Session persistence tested
- [ ] Password hashing verified
- [ ] Security audit completed (OWASP checks)

### Documentation & Deployment
- [ ] Authentication architecture documented
- [ ] Admin setup guide created
- [ ] Environment configuration guide
- [ ] Security best practices documented
- [ ] Deployment procedures with auth setup

---

## 🎯 Definition of Done

- [ ] All API keys removed from JavaScript
- [ ] Environment variables properly configured
- [ ] Admin authentication fully functional
- [ ] Session management working
- [ ] Protected routes enforced
- [ ] Authentication tests passing
- [ ] Build artifact verification passed
- [ ] Security audit passed (0 CRITICAL)
- [ ] Documentation complete
- [ ] Story marked "Ready for Review"

---

## 📋 Tasks

### Task 1: Secure API Key Management ✅ PLACEHOLDER
**Effort:** 4 hours
**Subtasks:**
- [ ] 1.1 Audit current API key exposure in code
- [ ] 1.2 Create .env.local template with all required keys
- [ ] 1.3 Update vite.config.ts for VITE_* injection
- [ ] 1.4 Update App.tsx to use injected keys
- [ ] 1.5 Verify no keys exposed in dist/ build artifact
- [ ] 1.6 Update README with environment setup

### Task 2: Implement Admin Authentication ✅ PLACEHOLDER
**Effort:** 6 hours
**Subtasks:**
- [ ] 2.1 Create AuthContext for session management
- [ ] 2.2 Create LoginForm component with validation
- [ ] 2.3 Implement password hashing (bcryptjs)
- [ ] 2.4 Create admin credentials storage (secure)
- [ ] 2.5 Implement logout functionality
- [ ] 2.6 Test authentication flow end-to-end

### Task 3: Protect Admin Routes & Pages ✅ PLACEHOLDER
**Effort:** 4 hours
**Subtasks:**
- [ ] 3.1 Create ProtectedRoute component (auth guard)
- [ ] 3.2 Wrap Settings.tsx with authentication
- [ ] 3.3 Add logout button to admin panel
- [ ] 3.4 Implement session persistence (localStorage)
- [ ] 3.5 Test unauthorized access redirect
- [ ] 3.6 Add auth status indicator to UI

### Task 4: Secure Gemini & Supabase Integration ✅ PLACEHOLDER
**Effort:** 3 hours
**Subtasks:**
- [ ] 4.1 Update termService.ts for safe key injection
- [ ] 4.2 Add fallback to local DB if key missing
- [ ] 4.3 Implement API error handling (429 rate limit)
- [ ] 4.4 Update supabase.ts with proper validation
- [ ] 4.5 Test graceful degradation without API keys
- [ ] 4.6 Add logging for key initialization

### Task 5: Security Testing & Verification ✅ PLACEHOLDER
**Effort:** 1 hour
**Subtasks:**
- [ ] 5.1 Verify no API keys in dist/ folder
- [ ] 5.2 Test environment variable injection
- [ ] 5.3 Check browser DevTools for key exposure
- [ ] 5.4 Validate OWASP security checklist
- [ ] 5.5 Document security validations
- [ ] 5.6 Create security audit report

---

## 🔧 Technical Details

### Architecture: Authentication Flow

```
User Login Request
    ↓
LoginForm Component
    ↓
AuthContext (validatePassword)
    ↓
Password Comparison (bcrypt)
    ↓
JWT/Session Token Generation
    ↓
LocalStorage Persistence
    ↓
Protected Routes Check
    ↓
Grant Access or Redirect to Login
```

### API Key Injection Pattern

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  define: {
    __GEMINI_API_KEY__: JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
    __SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
});

// At build time, Vite replaces __GEMINI_API_KEY__ with actual value
// Resulting JS has: const GEMINI_API_KEY = "sk-proj-..."
// This is build-time injection, not visible in source or network requests
```

### Admin Authentication Context

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  validateSession: () => boolean;
}

// Credentials stored as bcrypt hash, not plain text
// Session persisted in localStorage with validation
// Logout clears session and context state
```

### Protected Route Component

```typescript
<ProtectedRoute>
  <Settings />
</ProtectedRoute>

// If not authenticated: redirects to /login
// If authenticated: renders protected component
// Session validated on route access
```

### Environment Variables Schema

```
VITE_GEMINI_API_KEY=sk-proj-xxx...     # Google Gemini API key
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...      # Supabase anonymous key
ADMIN_PASSWORD_HASH=bcrypt_hash_here   # Bcrypt hash of admin password (not plain text)
```

### Security Checklist

✅ Passwords hashed (bcryptjs)
✅ No plain text credentials in .env
✅ API keys injected at build time only
✅ Session tokens JWT or secure cookies
✅ Authentication on protected routes
✅ OWASP Top 10 compliance
✅ XSS prevention (React auto-escapes)
✅ CSRF protection awareness
✅ Secure headers documentation

---

## 🧪 Quality Gates

### Pre-Commit
- [ ] No hardcoded API keys
- [ ] No plain text passwords
- [ ] Environment variables properly prefixed
- [ ] bcryptjs imported and used

### Pre-PR
- [ ] Authentication tests passing
- [ ] Protected routes validated
- [ ] Build artifact verification (no keys in dist/)
- [ ] Security audit completed

### Pre-Deploy
- [ ] Admin password hash generated securely
- [ ] Environment variables configured on deployment platform
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Authentication tested on staging

---

## 📚 File List

### Files to Create
- `src/context/AuthContext.tsx` - Authentication session management
- `src/pages/LoginPage.tsx` - Admin login form
- `src/components/ProtectedRoute.tsx` - Route authentication guard
- `src/hooks/useAuth.ts` - Authentication hook
- `.env.example` - Environment variables template
- `docs/auth/AUTHENTICATION-GUIDE.md` - Setup and usage
- `docs/auth/SECURITY-BEST-PRACTICES.md` - Security guidelines
- `tests/auth.test.ts` - Authentication tests

### Files to Modify
- `vite.config.ts` - Add VITE_* variable injection
- `src/App.tsx` - Add login route and ProtectedRoute wrapper
- `src/pages/Settings.tsx` - Add authentication check and logout
- `src/services/termService.ts` - Use injected API key safely
- `src/services/supabase.ts` - Add proper initialization validation
- `tsconfig.json` - Update for injected globals
- `package.json` - Add bcryptjs dependency

### Files to Delete
- None (no deprecations)

---

## 📝 Change Log

### Version 1.0 (Draft)
- Story created from EPIC-TD-001
- 5 tasks with detailed subtasks
- Security-first approach emphasized
- Environment variable injection pattern documented

---

## 🔗 References

- **OWASP Auth Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-modes.html
- **bcryptjs Security:** https://www.npmjs.com/package/bcryptjs
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8949
- **Supabase Auth:** https://supabase.com/docs/guides/auth

---

## 👤 Agent Model Used

**Assigned To:** @dev (Dex)
**Specialized Agents Needed:**
- @dev (Dex) - Frontend implementation
- @devops (Gage) - Environment configuration and deployment
- @qa (Quinn) - Security testing and validation

---

## 📝 Dev Agent Record

### Current Task
⏳ AWAITING IMPLEMENTATION

### Prerequisites (Dependencies)
- ✅ TD-101: Database Migrations (completed)
- ✅ TD-102: Backup & Recovery (completed)
- ✅ TD-103: Database Security RLS (completed)
- ✅ TD-204: Keyboard Accessibility (completed)

### Implementation Notes
- This story removes CRITICAL security debt items C4 and C5
- Replaces weak plain-text admin password with bcrypt hashing
- Implements build-time API key injection (zero exposure)
- Adds authentication layer to Settings page

### Testing Strategy
- Unit tests for AuthContext
- Integration tests for Protected Routes
- Security tests for API key injection
- Manual verification of build artifact

### Rollback Strategy
- Revert vite.config.ts changes
- Restore original .env files
- Remove AuthContext and ProtectedRoute
- Restore Settings.tsx without auth

---

**Created by:** River (Scrum Master)
**Created:** 2026-02-02
**Status:** Ready for Dev

---

## 🚀 Next Steps for Developer

1. Read this entire story file completely
2. Understand the authentication architecture diagram
3. Check prerequisites are complete (TD-101, TD-102, TD-103, TD-204)
4. Begin with Task 1 (API Key Management)
5. Follow acceptance criteria checklist
6. Update task checkboxes as you complete work
7. Update File List section with new/modified files
8. Mark story "Ready for Review" when complete
9. Notify @github-devops for push and PR creation
