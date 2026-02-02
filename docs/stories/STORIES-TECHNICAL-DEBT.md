# Technical Debt Resolution - Story Backlog (24 Stories)

**Epic:** EPIC-TD-001 (Technical Debt Resolution)
**Total Effort:** 290 hours
**Timeline:** 8-10 weeks
**Status:** 🟢 Ready for Sprint Planning

---

## PHASE 1: Foundations (Week 1) - 58 hours

### Story TD-101: Database Migrations Infrastructure
**Effort:** 16 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **database engineer**, I want to **establish migration infrastructure** so that **all future schema changes are tracked, reversible, and auditable**.

#### Acceptance Criteria
- [ ] `supabase/migrations/` directory created with proper structure
- [ ] Migration file `001_create_terms_table.sql` includes:
  - `id` (UUID, PRIMARY KEY)
  - `term` (VARCHAR, NOT NULL, UNIQUE)
  - `category` (VARCHAR, NOT NULL with CHECK constraint)
  - `definition`, `phonetic`, `slang`, `translation` (TEXT fields)
  - `examples`, `analogies` (JSONB with NOT NULL constraint)
  - `relatedTerms` (JSONB array)
  - `created_at`, `updated_at`, `deleted_at` (TIMESTAMP fields)
- [ ] NOT NULL constraints on all required fields
- [ ] CHECK constraints on category (valid values: 'Desenvolvimento', 'Infraestrutura', etc.)
- [ ] UNIQUE constraint on `term`
- [ ] Default values: `created_at = NOW()`, `updated_at = NOW()`
- [ ] Soft delete support via `deleted_at` column
- [ ] Migration rollback script (`001_rollback.sql`) tested successfully
- [ ] Migration applied to dev database without errors
- [ ] Schema snapshot captured (`db-snapshot-001.sql`)

#### Technical Details
- **Database:** Supabase PostgreSQL
- **File format:** Pure SQL (no ORM-generated migrations)
- **Rollback strategy:** Explicit rollback scripts, snapshot-based recovery
- **Validation:** CodeRabbit SQL review + manual DBA review

#### Dependencies
- None (Phase 1 blocker)

#### Quality Gates
- **Pre-Commit:** SQL syntax validation, schema review
- **Pre-PR:** CodeRabbit approval, rollback script tested
- **Pre-Deploy:** DBA sign-off, production backup verified

#### Definition of Done
- [ ] Migration files merged to main
- [ ] Documentation in `supabase/docs/migrations/README.md`
- [ ] Schema diagram updated
- [ ] Team trained on migration procedure

#### Notes
- Use `supabase migration create` CLI for consistency
- Store in version control as source of truth
- Never modify migrations after deployment (create new migration instead)

---

### Story TD-102: Database Backup & Recovery
**Effort:** 4 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As an **operations engineer**, I want to **establish automated backup and recovery procedures** so that **data can be restored in case of accidental deletion or corruption**.

#### Acceptance Criteria
- [ ] Supabase automated backups enabled
  - [ ] Daily backup schedule configured
  - [ ] Retention period set to 30 days
  - [ ] Backup location verified (Supabase-managed S3)
- [ ] Manual backup script created (`scripts/db-backup.sh`)
  - [ ] Uses `pg_dump` to create full database dump
  - [ ] Compressed to `.sql.gz` format
  - [ ] Timestamped and stored in `backups/` directory
  - [ ] Executable from CI/CD pipeline
- [ ] Recovery procedure documented in `supabase/docs/RECOVERY.md`
  - [ ] Step-by-step recovery from backup
  - [ ] Estimated recovery time
  - [ ] Testing procedure
- [ ] Backup restoration tested successfully on test database
- [ ] Monitoring alert configured for failed backups

#### Technical Details
- **Tool:** Supabase automated backups + pg_dump
- **Frequency:** Automated daily + manual on-demand
- **Storage:** Supabase S3 + local backups directory
- **Encryption:** Automatic (Supabase managed)

#### Dependencies
- TD-101 (Database schema must exist)

#### Quality Gates
- **Pre-Commit:** Backup script syntax review
- **Pre-PR:** Recovery test execution successful

#### Definition of Done
- [ ] Backup procedure documented
- [ ] Recovery procedure tested
- [ ] Team trained on manual backup
- [ ] Monitoring dashboard shows backup status

---

### Story TD-103: Accessibility Audit & A11y Fixes
**Effort:** 12 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **UX designer**, I want to **conduct comprehensive accessibility audit and fix critical issues** so that **Desbuquei meets WCAG AA compliance baseline**.

#### Acceptance Criteria
- [ ] WAVE accessibility audit run on all pages
  - [ ] Dashboard page
  - [ ] Glossary page
  - [ ] Term detail page
  - [ ] History page
  - [ ] Favorites page
  - [ ] Settings page
- [ ] Critical issues fixed (Errors < 5):
  - [ ] Color contrast ratio ≥ 4.5:1 (all text)
  - [ ] Form labels paired with inputs (`<label htmlFor>`)
  - [ ] Aria-labels on icon buttons
  - [ ] Page structure uses semantic HTML
- [ ] Keyboard navigation tested
  - [ ] Tab key navigates all interactive elements
  - [ ] Shift+Tab navigates backwards
  - [ ] Enter/Space activates buttons
  - [ ] Escape closes modals
- [ ] Screen reader tested (NVDA/JAWS)
  - [ ] Page title announced
  - [ ] Headings navigable
  - [ ] Form inputs labeled
  - [ ] Buttons have accessible names
- [ ] WCAG AA score ≥ 85% (baseline)

#### Technical Details
- **Audit tool:** WAVE (WebAIM)
- **Standards:** WCAG 2.1 Level AA
- **Testing:** Manual + automated
- **Validation:** CodeRabbit a11y rules + manual QA

#### Dependencies
- None (parallel with TD-101, TD-102)

#### Quality Gates
- **Pre-Commit:** axe-core linter checks
- **Pre-PR:** WAVE audit passed

#### Definition of Done
- [ ] All CRITICAL a11y issues resolved
- [ ] Audit report documented
- [ ] Team trained on a11y best practices
- [ ] Accessible component patterns documented

#### Notes
- Focus on high-impact issues first (color contrast, labels, semantic HTML)
- Leave advanced features (WAI-ARIA) for H1 story
- Document baseline WCAG compliance level

---

### Story TD-104: Color Mapping DRY Refactor
**Effort:** 3 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **frontend developer**, I want to **extract duplicate color mapping logic into reusable utility** so that **color theme changes only need to be made in one place**.

#### Acceptance Criteria
- [ ] Create `src/utils/categoryColors.ts` utility module
  - [ ] Function `getCategoryColor(category: string): { light: string; dark: string }`
  - [ ] Returns consistent color for category in both themes
  - [ ] Supports all 6 categories: Desenvolvimento, Infraestrutura, Dados & IA, Segurança, Agile & Produto
  - [ ] Includes TypeScript types for type safety
- [ ] Refactor 3 files to use utility:
  - [ ] `src/components/Card.tsx` - replace inline mapping
  - [ ] `src/components/Layout.tsx` - replace inline mapping
  - [ ] `src/pages/Dashboard.tsx` - replace inline mapping
- [ ] All references updated
- [ ] Visual regression testing passes (colors identical)
- [ ] Unit tests for utility function

#### Technical Details
- **Language:** TypeScript
- **Pattern:** Utility function + React hook (if needed for dark mode)
- **Testing:** Unit test covering all 6 categories, both light/dark modes

#### Dependencies
- None (parallel with other Phase 1 work)

#### Quality Gates
- **Pre-Commit:** ESLint, TypeScript strict mode
- **Pre-PR:** Visual regression test, unit test coverage > 90%

#### Definition of Done
- [ ] Utility merged to main
- [ ] 3 files refactored and tested
- [ ] No visual regressions
- [ ] Documentation in utility file

---

### Story TD-105: Testing Framework Bootstrap
**Effort:** 8 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **QA engineer**, I want to **establish testing infrastructure** so that **developers can write unit and integration tests**.

#### Acceptance Criteria
- [ ] Vitest installed and configured
  - [ ] `vitest.config.ts` created
  - [ ] Coverage thresholds set: global ≥ 60%, functions ≥ 50%
  - [ ] Watch mode working (`npm run test:watch`)
- [ ] React Testing Library configured
  - [ ] `@testing-library/react` installed
  - [ ] `@testing-library/user-event` for user interactions
  - [ ] Test utilities file created (`src/test-utils.tsx`)
- [ ] First example tests written
  - [ ] 1 component test (e.g., Card component)
  - [ ] 1 hook test (e.g., useTheme)
  - [ ] 1 utility test (e.g., normalizeId)
- [ ] Coverage report generated
  - [ ] HTML coverage report at `coverage/`
  - [ ] Coverage badge in README
- [ ] CI pipeline configured to run tests
  - [ ] Tests run on every PR
  - [ ] Coverage report uploaded to CI dashboard

#### Technical Details
- **Testing framework:** Vitest (Vite-native)
- **Component testing:** React Testing Library (DOM-focused)
- **Coverage:** c8 (built into Vitest)
- **CI integration:** GitHub Actions

#### Dependencies
- None (enables TD-205, TD-305, TD-405, TD-505)

#### Quality Gates
- **Pre-Commit:** Tests must pass, no coverage regression
- **Pre-PR:** Coverage report reviewed

#### Definition of Done
- [ ] Testing infrastructure merged to main
- [ ] Example tests passing
- [ ] CI pipeline running tests automatically
- [ ] Team trained on test writing

#### Notes
- Vitest chosen over Jest for Vite compatibility
- Focus on test examples (not 100% coverage yet)
- Coverage targets will increase in later phases

---

### Story TD-106: Error Tracking Setup (Sentry)
**Effort:** 4 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **developer**, I want to **capture runtime errors in production** so that **we can debug issues without waiting for user reports**.

#### Acceptance Criteria
- [ ] Sentry account created and project configured
  - [ ] Organization created
  - [ ] React project initialized
  - [ ] DSN obtained and stored in `.env`
- [ ] Sentry SDK installed (`@sentry/react`)
  - [ ] Initialized in `main.tsx` before React render
  - [ ] ErrorBoundary configured
  - [ ] User context set (if auth available)
- [ ] Error capture verified
  - [ ] Test error logged and appears in Sentry dashboard
  - [ ] Stack trace readable (source maps uploaded)
  - [ ] Browser information captured
- [ ] Performance monitoring enabled
  - [ ] Page load metrics tracked
  - [ ] Component render performance monitored
  - [ ] API response times tracked
- [ ] Alerting configured
  - [ ] CRITICAL errors trigger Slack notification
  - [ ] Email digest for daily summary
- [ ] Privacy compliance
  - [ ] PII redaction enabled
  - [ ] URL filtering configured
  - [ ] Breadcrumb limits set to prevent data bloat

#### Technical Details
- **Error tracking:** Sentry
- **SDK:** @sentry/react
- **Source maps:** Uploaded to Sentry during build
- **Compliance:** GDPR-compliant data capture

#### Dependencies
- None (parallel with other Phase 1 work)

#### Quality Gates
- **Pre-Commit:** Error handling code reviewed
- **Pre-PR:** Sentry integration tested

#### Definition of Done
- [ ] Sentry dashboard accessible to team
- [ ] Error capture verified with test error
- [ ] Alerting working
- [ ] Documentation in `docs/operations/error-tracking.md`

---

### Story TD-107: Project Manager Setup & Coordination
**Effort:** 8 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 1, Week 1

#### User Story
As a **project manager**, I want to **establish coordination infrastructure and team cadence** so that **epic execution is tracked and stakeholders are informed**.

#### Acceptance Criteria
- [ ] Sprint board created
  - [ ] JIRA/Linear/GitHub Projects configured
  - [ ] Epics and stories mapped
  - [ ] Phase 1 stories backlog organized
  - [ ] Burndown chart visible
- [ ] Team calendar scheduled
  - [ ] Daily standup: 15 minutes (10:00 AM)
  - [ ] Weekly sync: 1 hour (every Friday)
  - [ ] Weekly status report: for stakeholders
  - [ ] Blockers/risks review: as needed
- [ ] Risk register created
  - [ ] Initial risks documented (from technical debt assessment)
  - [ ] Mitigation strategies assigned
  - [ ] Risk update frequency established (weekly)
- [ ] Communication plan
  - [ ] Slack channel #desbuquei-tech-debt created
  - [ ] Weekly status email template created
  - [ ] Stakeholder update schedule defined
- [ ] Documentation structure
  - [ ] `docs/progress/PHASE-1.md` created with metrics
  - [ ] Success criteria checklist
  - [ ] Phase milestones tracked
- [ ] Team onboarding
  - [ ] Agent assignments confirmed (@data-engineer, @dev, @qa, @ux-expert)
  - [ ] Development environment validated for all team members
  - [ ] Kick-off meeting scheduled

#### Technical Details
- **Tool:** Linear/JIRA for sprint tracking
- **Communication:** Slack + weekly email reports
- **Documentation:** Markdown in `docs/progress/`
- **Metrics:** Burndown chart, velocity, completion rate

#### Dependencies
- None (enables all Phase 1 work)

#### Quality Gates
- **Pre-Execution:** Team assembled, calendar confirmed
- **During execution:** Weekly status reports delivered
- **Post-phase:** Lessons learned documented

#### Definition of Done
- [ ] Sprint board live with all Phase 1 stories
- [ ] Daily standups starting
- [ ] Weekly status report template activated
- [ ] Risk register updated weekly
- [ ] Team fully onboarded and ready

#### Notes
- This story enables coordination of all other Phase 1 work
- Update risk register weekly based on actual progress
- Escalate blockers immediately (don't wait for weekly sync)

---

## PHASE 2: Infrastructure & System Design (Week 2) - 54 hours

### Story TD-201: RLS Policies Implementation
**Effort:** 10 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 2, Week 2

#### User Story
As a **database engineer**, I want to **implement Row Level Security policies** so that **data access is controlled at the database level**.

#### Acceptance Criteria
- [ ] RLS enabled on `public.terms` table
  - [ ] `ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY`
  - [ ] DROP any existing policies (clean slate)
- [ ] Policy 1: Anonymous Read Access
  - [ ] SELECT policy for authenticated users
  - [ ] Condition: `auth.role() = 'authenticated'`
  - [ ] Test: Users can read all terms
- [ ] Policy 2: Admin Full Access
  - [ ] SELECT, INSERT, UPDATE, DELETE for admin role
  - [ ] Condition: `auth.jwt()->>'role' = 'admin'`
  - [ ] Test: Admins can modify terms
- [ ] Policy 3: User Update Own Data (if applicable)
  - [ ] UPDATE policy for user-specific fields
  - [ ] Condition: `auth.uid() = user_id`
  - [ ] Test: Users can only update their own data
- [ ] RLS policies tested with positive/negative cases
  - [ ] Test as authenticated user: ✅ can read
  - [ ] Test as admin: ✅ can read/write/delete
  - [ ] Test as unauthenticated: ✅ blocked (or public read)
  - [ ] Test cross-user access: ✅ blocked
- [ ] Documentation created
  - [ ] Policy logic explained in comments
  - [ ] Test cases documented
  - [ ] Migration script includes RLS setup
- [ ] Performance impact assessed
  - [ ] Query plans with RLS policies reviewed
  - [ ] No significant slowdown (< 5% impact expected)

#### Technical Details
- **Security level:** Row-level access control
- **Auth layer:** Supabase JWT
- **Testing:** Direct SQL tests + application-level tests
- **Validation:** CodeRabbit + manual security review

#### Dependencies
- TD-101 (Database schema must exist)

#### Quality Gates
- **Pre-Commit:** RLS policy syntax validation
- **Pre-PR:** Security review, positive/negative test cases
- **Pre-Deploy:** Admin sign-off on access model

#### Definition of Done
- [ ] RLS policies merged to main
- [ ] Test cases documented
- [ ] Performance impact verified (acceptable)
- [ ] Team trained on RLS model

#### Notes
- Start with conservative RLS (deny by default)
- Test from application code to ensure policies work with Supabase client
- Document intended access patterns for future developers

---

### Story TD-202: Database Indexes & Query Optimization
**Effort:** 4 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 2, Week 2

#### User Story
As a **database engineer**, I want to **add indexes to frequently queried columns** so that **queries perform efficiently at scale**.

#### Acceptance Criteria
- [ ] Index 1: Category search
  - [ ] `CREATE INDEX idx_terms_category ON public.terms(category)`
  - [ ] Query plan shows index scan
  - [ ] Query performance: < 10ms for 1000+ terms
- [ ] Index 2: Creation timestamp
  - [ ] `CREATE INDEX idx_terms_created_at ON public.terms(created_at DESC)`
  - [ ] Enables efficient pagination
  - [ ] Query plan shows index scan
- [ ] Index 3: Composite (search optimization)
  - [ ] `CREATE INDEX idx_terms_search ON public.terms(category, created_at)`
  - [ ] Enables combined queries
  - [ ] Query plan shows index scan
- [ ] Index 4: Soft deletes
  - [ ] `CREATE INDEX idx_terms_deleted_at ON public.terms(deleted_at) WHERE deleted_at IS NULL`
  - [ ] Indexes only non-deleted rows
  - [ ] Reduces index size
- [ ] Index impact assessed
  - [ ] Index size < 10MB expected
  - [ ] INSERT/UPDATE overhead < 5%
  - [ ] Query performance improved ≥ 50%
- [ ] Documentation
  - [ ] Index strategy documented
  - [ ] Query patterns documented
  - [ ] EXPLAIN plans attached

#### Technical Details
- **Tool:** PostgreSQL native indexes
- **Analysis:** EXPLAIN ANALYZE query plans
- **Baseline:** Before/after query timing

#### Dependencies
- TD-101, TD-201 (Database and RLS setup)

#### Quality Gates
- **Pre-Commit:** Index syntax validation
- **Pre-PR:** Query plan review, performance test results

#### Definition of Done
- [ ] Indexes created and verified
- [ ] Performance improvement documented
- [ ] No negative impact on write performance
- [ ] Index maintenance plan documented

---

### Story TD-203: Design Tokens Extraction (W3C DTCG)
**Effort:** 8 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 2, Week 2

#### User Story
As a **design system architect**, I want to **extract all design tokens from current codebase into standardized format** so that **design values are documented and reusable**.

#### Acceptance Criteria
- [ ] Design tokens extracted
  - [ ] Color tokens (6 themes × 10 colors = 60 tokens)
  - [ ] Typography tokens (font families, sizes, weights)
  - [ ] Spacing tokens (gap, padding, margin scales)
  - [ ] Border radius tokens (rounded, rounded-lg, etc.)
  - [ ] Shadow tokens (box-shadow variants)
  - [ ] Duration tokens (animation timings)
- [ ] Token format: W3C Design Tokens Community Group (DTCG)
  - [ ] File: `design-tokens.json` (standardized format)
  - [ ] Structure: `{ "color": { "primary": {...}, ...}, "typography": {...} }`
  - [ ] Valid against W3C DTCG schema
- [ ] Token documentation created
  - [ ] Markdown guide: `docs/design-system/TOKENS.md`
  - [ ] Usage examples for each token group
  - [ ] Color palette reference (visual + code)
  - [ ] Typography scale reference
- [ ] Token validation
  - [ ] All colors used in codebase covered
  - [ ] All typography sizes covered
  - [ ] No hardcoded magic numbers in CSS
  - [ ] Tokens complete and validated
- [ ] Export formats created
  - [ ] CSS variables (`tokens.css`)
  - [ ] JavaScript/TypeScript object (`tokens.ts`)
  - [ ] Tailwind config reference (`tokens.tailwind.js`)

#### Technical Details
- **Format:** W3C DTCG JSON
- **Tools:** Token transformer (DTCG-compliant)
- **Documentation:** Markdown + examples
- **Validation:** Schema validation

#### Dependencies
- TD-104 (Color mapping should be complete for reference)

#### Quality Gates
- **Pre-Commit:** Token format validation
- **Pre-PR:** Token documentation review, completeness check

#### Definition of Done
- [ ] `design-tokens.json` merged to main
- [ ] Token documentation published
- [ ] All team members able to reference tokens
- [ ] Export formats (CSS, TS) generated

#### Notes
- Use tokens from current Tailwind config and custom CSS
- Document mapping between design tokens and Tailwind utilities
- Plan Phase 3 integration with design system

---

### Story TD-204: Keyboard Navigation & A11y Deep Audit
**Effort:** 6 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 2, Week 2

#### User Story
As a **UX designer**, I want to **audit and fix keyboard navigation** so that **all interactive elements are accessible via keyboard**.

#### Acceptance Criteria
- [ ] Keyboard navigation tested on all pages
  - [ ] Tab key cycles through interactive elements in logical order
  - [ ] Shift+Tab navigates backwards
  - [ ] Focus indicator visible (≥ 3px, ≥ 3:1 contrast)
  - [ ] Focus order follows visual flow (top-to-bottom, left-to-right)
- [ ] Modal/dialog keyboard behavior
  - [ ] Escape closes modal
  - [ ] Focus trapped within modal (no tabbing out)
  - [ ] Focus returned to trigger element on close
- [ ] VoiceAssistant keyboard support
  - [ ] Keyboard shortcut to activate (e.g., Alt+V)
  - [ ] Keyboard shortcut documented
  - [ ] Voice control works without mouse
- [ ] Form keyboard support
  - [ ] Form fields labeled and associated
  - [ ] Required field indicators accessible
  - [ ] Error messages linked to fields
  - [ ] Form submission works via keyboard
- [ ] Interactive component audit
  - [ ] Buttons have visible focus states
  - [ ] Links have visible focus states
  - [ ] Dropdowns navigable via arrow keys
  - [ ] Checkboxes/radios navigable via keyboard
- [ ] Documentation
  - [ ] Keyboard shortcuts documented in Help section
  - [ ] Developer guide for keyboard support added

#### Technical Details
- **Testing:** Manual keyboard navigation + automated a11y tools
- **Tools:** axe DevTools, NVDA screen reader
- **Standards:** WCAG 2.1 Level AA

#### Dependencies
- TD-103 (Basic a11y fixes should be complete)

#### Quality Gates
- **Pre-Commit:** axe-core keyboard checks
- **Pre-PR:** Manual keyboard navigation test report

#### Definition of Done
- [ ] All interactive elements keyboard accessible
- [ ] Focus management verified
- [ ] Modals trap focus correctly
- [ ] Keyboard shortcuts documented
- [ ] Accessibility score > 90 for keyboard support

---

### Story TD-205: Unit Tests - Context Hooks
**Effort:** 8 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 2, Week 2

#### User Story
As a **QA engineer**, I want to **write unit tests for React Context hooks** so that **state management is reliable and regressions are caught**.

#### Acceptance Criteria
- [ ] ThemeContext tests
  - [ ] Test: Initialize with default theme
  - [ ] Test: Switch between light/dark mode
  - [ ] Test: Persist theme to localStorage
  - [ ] Test: 6 color themes switch correctly
  - [ ] Coverage: > 90%
- [ ] FavoritesContext tests
  - [ ] Test: Add favorite term
  - [ ] Test: Remove favorite term
  - [ ] Test: Persist favorites to localStorage
  - [ ] Test: Empty favorites list
  - [ ] Coverage: > 90%
- [ ] HistoryContext tests
  - [ ] Test: Add search to history
  - [ ] Test: Clear history
  - [ ] Test: Prevent duplicates (optional)
  - [ ] Test: Persist to localStorage
  - [ ] Coverage: > 90%
- [ ] VoiceContext tests
  - [ ] Test: Voice input state transitions
  - [ ] Test: Voice output synthesis
  - [ ] Test: Error handling (no microphone)
  - [ ] Coverage: > 80% (some browser APIs hard to test)
- [ ] Integration tests
  - [ ] Test: Multiple contexts used together
  - [ ] Test: Context consumption in components
  - [ ] Coverage: > 80%
- [ ] Test quality
  - [ ] Tests readable and maintainable
  - [ ] Mocking strategy consistent
  - [ ] No flaky tests (run 10x passes)

#### Technical Details
- **Framework:** Vitest + React Testing Library
- **Mocking:** jest.mock for localStorage, Web APIs
- **Coverage target:** ≥ 80% for all contexts

#### Dependencies
- TD-105 (Testing framework must be set up)

#### Quality Gates
- **Pre-Commit:** Tests pass, coverage maintained
- **Pre-PR:** Coverage report shows > 80%

#### Definition of Done
- [ ] Context hook tests merged to main
- [ ] Coverage reports show > 80% for contexts
- [ ] All tests passing consistently
- [ ] Developers follow test patterns in new context code

#### Notes
- Use `renderHook` from React Testing Library for hook testing
- Mock localStorage to avoid test pollution
- Test both happy path and error cases

---

### Story TD-206: Rate Limiting Implementation
**Effort:** 4 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 2, Week 2

#### User Story
As a **security engineer**, I want to **implement rate limiting on API calls** so that **the app is protected from abuse and DDoS attacks**.

#### Acceptance Criteria
- [ ] Rate limiting rules configured
  - [ ] Gemini API calls: max 10 per minute per user (IP)
  - [ ] Search requests: max 30 per minute
  - [ ] Seed database: max 1 per day per user
- [ ] Client-side rate limiting
  - [ ] Debounce search input (300ms)
  - [ ] Disable buttons during API calls
  - [ ] Show "Rate limited" message if quota exceeded
  - [ ] Retry logic with exponential backoff
- [ ] Server-side rate limiting (if backend proxy implemented)
  - [ ] Redis-based rate limiter
  - [ ] Rate limit headers returned to client
  - [ ] Graceful degradation when rate limited
- [ ] Monitoring
  - [ ] Rate limit hits logged
  - [ ] Alert if abuse detected (>100 hits/min)
- [ ] Documentation
  - [ ] Rate limit policy documented for users
  - [ ] Developer guide for adding rate limits

#### Technical Details
- **Client:** js-rate-limiter or custom implementation
- **Server:** redis-rate-limiter (if backend implemented)
- **Logging:** Sent to Sentry for monitoring

#### Dependencies
- None (can be implemented independently)

#### Quality Gates
- **Pre-Commit:** Rate limiter logic reviewed
- **Pre-PR:** Functional test of rate limiting behavior

#### Definition of Done
- [ ] Rate limiting merged to main
- [ ] All API calls respect limits
- [ ] Monitoring configured
- [ ] Users notified when rate limited
- [ ] Documentation published

---

### Story TD-207: Constants File Creation
**Effort:** 2 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 2, Week 2

#### User Story
As a **developer**, I want to **centralize all magic numbers and string constants** so that **configuration is easy to find and maintain**.

#### Acceptance Criteria
- [ ] `src/constants.ts` created
  - [ ] API-related constants (endpoints, timeouts)
  - [ ] UI-related constants (animation durations, delays)
  - [ ] Business logic constants (rate limits, thresholds)
  - [ ] Error messages (standard error text)
  - [ ] Regular expressions (validation patterns)
- [ ] All magic numbers replaced with constants
  - [ ] Search debounce: `SEARCH_DEBOUNCE_MS`
  - [ ] API timeout: `API_TIMEOUT_MS`
  - [ ] Animation duration: `ANIMATION_DURATION_MS`
  - [ ] All hardcoded values converted
- [ ] TypeScript enums for categorical constants
  - [ ] Categories: `enum CATEGORY { ... }`
  - [ ] Themes: `enum THEME { ... }`
  - [ ] Error types: `enum ERROR_TYPE { ... }`
- [ ] Documentation
  - [ ] Constants file documented
  - [ ] Usage examples for each constant

#### Technical Details
- **File:** `src/constants.ts`
- **Format:** TypeScript with JSDoc comments
- **Organization:** Grouped by feature/domain

#### Dependencies
- None (can be created anytime)

#### Quality Gates
- **Pre-Commit:** No undefined constants, TypeScript validation
- **Pre-PR:** All magic numbers replaced

#### Definition of Done
- [ ] Constants file merged to main
- [ ] No hardcoded magic numbers remain in codebase
- [ ] All references use constants
- [ ] Documentation explains each constant

---

### Story TD-208: VoiceAssistant Audio Codec Extraction
**Effort:** 6 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 2, Week 2

#### User Story
As a **frontend developer**, I want to **extract audio codec logic from VoiceAssistant** so that **the component is simpler and audio functionality is reusable**.

#### Acceptance Criteria
- [ ] Create `src/services/audioCodec.ts` utility
  - [ ] Function: `encodeAudioToBase64(audioBuffer: AudioBuffer): string`
  - [ ] Function: `decodeBase64ToAudio(base64: string): AudioBuffer`
  - [ ] Function: `recordAudio(): Promise<AudioBuffer>`
  - [ ] Function: `playAudio(base64: string): Promise<void>`
  - [ ] Proper error handling and type safety
- [ ] Create `src/hooks/useAudioRecording.ts` hook
  - [ ] Encapsulates microphone permission handling
  - [ ] State: `isRecording`, `audioBuffer`, `error`
  - [ ] Methods: `startRecording()`, `stopRecording()`
  - [ ] Auto-cleanup on unmount
- [ ] Create `src/hooks/useAudioPlayback.ts` hook
  - [ ] Encapsulates audio playback state
  - [ ] Methods: `play(base64)`, `stop()`, `pause()`
  - [ ] State: `isPlaying`, `progress`
  - [ ] Auto-cleanup on unmount
- [ ] Update VoiceAssistant component
  - [ ] Use new hooks instead of inline logic
  - [ ] Reduce component from 477 to < 250 lines
  - [ ] Same functionality, cleaner code
  - [ ] All tests passing
- [ ] Add unit tests
  - [ ] Test audio codec functions
  - [ ] Test recording hook
  - [ ] Test playback hook
  - [ ] Coverage: > 80%
- [ ] Documentation
  - [ ] Audio codec documented
  - [ ] Hook usage examples
  - [ ] Browser compatibility noted

#### Technical Details
- **APIs:** Web Audio API, MediaRecorder API
- **Framework:** React hooks pattern
- **Testing:** Vitest + mock Web APIs

#### Dependencies
- TD-105 (Testing framework must exist)

#### Quality Gates
- **Pre-Commit:** TypeScript strict mode, tests passing
- **Pre-PR:** Code review, no regression

#### Definition of Done
- [ ] Audio utils and hooks extracted
- [ ] VoiceAssistant refactored and simplified
- [ ] All tests passing
- [ ] No regression in voice functionality
- [ ] Documentation published

#### Notes
- This enables reuse of audio functionality in future features
- Extracted code is easier to test and maintain
- VoiceAssistant becomes simpler React component

---

### Story TD-209: Project Coordination & Risk Tracking
**Effort:** 6 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 2, Week 2

#### User Story
As a **project manager**, I want to **conduct mid-epic review and track execution progress** so that **risks are mitigated and stakeholders are updated**.

#### Acceptance Criteria
- [ ] Phase 1 retrospective
  - [ ] What went well?
  - [ ] What could be improved?
  - [ ] Velocity tracked (planned vs actual)
  - [ ] Team feedback collected
- [ ] Risk register updated
  - [ ] New risks identified (if any)
  - [ ] Mitigation strategies reviewed
  - [ ] Impact/probability re-assessed
  - [ ] Watch list updated
- [ ] Progress metrics captured
  - [ ] % completion of Phase 1
  - [ ] Actual hours vs estimated
  - [ ] Burndown chart reviewed
  - [ ] Velocity trend analyzed
- [ ] Phase 2 planning
  - [ ] Sprint board prepared
  - [ ] Stories estimated and prioritized
  - [ ] Dependencies confirmed
  - [ ] Team capacity assessed
- [ ] Stakeholder communication
  - [ ] Weekly status report sent
  - [ ] Key accomplishments highlighted
  - [ ] Risks and mitigations explained
  - [ ] Timeline confirmation
- [ ] Documentation
  - [ ] Phase 1 metrics documented in `docs/progress/PHASE-1.md`
  - [ ] Phase 2 readiness checklist created
  - [ ] Lessons learned captured

#### Technical Details
- **Tools:** Linear/JIRA, Slack, email
- **Reporting:** Weekly status + ad-hoc risk updates
- **Metrics:** Burndown velocity, completion rate, effort accuracy

#### Dependencies
- None (coordination task, runs in parallel)

#### Quality Gates
- **Ongoing:** Weekly updates provided
- **Post-phase:** Metrics documented, lessons learned recorded

#### Definition of Done
- [ ] Phase 1 retrospective conducted
- [ ] Risk register updated
- [ ] Phase 2 sprint board prepared
- [ ] Stakeholder status report sent
- [ ] Team morale confirmed (team survey)

---

## PHASE 3: Design System & Components (Weeks 3-4) - 56 hours

### Story TD-301: Storybook Infrastructure Setup
**Effort:** 4 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 3

#### User Story
As a **design system architect**, I want to **set up Storybook** so that **components are documented and designers can review implementations**.

#### Acceptance Criteria
- [ ] Storybook installed and configured
  - [ ] `npm install -D @storybook/react @storybook/addon-essentials`
  - [ ] `.storybook/main.ts` created (Vite preset)
  - [ ] `.storybook/preview.ts` configured
  - [ ] Tailwind CSS configured for stories
- [ ] Storybook addons installed
  - [ ] Essentials (Controls, Actions, Docs)
  - [ ] A11y addon (accessibility testing)
  - [ ] Viewport addon (responsive testing)
  - [ ] Dark mode addon (theme switching)
- [ ] Storybook running locally
  - [ ] `npm run storybook` starts on port 6006
  - [ ] HMR working (edit story updates immediately)
  - [ ] Built documentation accessible
- [ ] Example story created
  - [ ] Button component story (6 variations)
  - [ ] Controls for size, variant, disabled
  - [ ] Actions logged for click events
  - [ ] Accessibility panel shows a11y issues
- [ ] CI/CD integration
  - [ ] Static build in CI pipeline
  - [ ] Published to `docs/storybook/` or Vercel
  - [ ] GitHub PR comment with Storybook link
- [ ] Documentation
  - [ ] Storybook guide in `docs/design-system/STORYBOOK.md`
  - [ ] How to write stories
  - [ ] Component story template

#### Technical Details
- **Version:** Storybook v7+ (latest React support)
- **Preset:** Vite (next gen)
- **Addons:** Essential + A11y + Viewport + Dark mode
- **Deployment:** Static build to hosting (Vercel/Netlify)

#### Dependencies
- TD-203 (Design tokens should be extracted)

#### Quality Gates
- **Pre-Commit:** Storybook builds without errors
- **Pre-PR:** Storybook link accessible in PR comment

#### Definition of Done
- [ ] Storybook runs locally and in CI
- [ ] Example stories demonstrate patterns
- [ ] Team can write stories using template
- [ ] Storybook deployed and accessible

#### Notes
- Storybook is now a development tool, not a design tool replacement
- Stories should match real component usage
- Use controls for component props interaction

---

### Story TD-302: Component Stories & Documentation
**Effort:** 12 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 3-4

#### User Story
As a **design system architect**, I want to **document all major components in Storybook** so that **designers and developers have a reference implementation**.

#### Acceptance Criteria
- [ ] Card organism stories
  - [ ] Default state
  - [ ] With favorite marked
  - [ ] With date displayed
  - [ ] All 6 category colors
  - [ ] Dark mode variants
  - [ ] Interactive actions (click, favorite)
- [ ] Layout organism stories
  - [ ] Desktop layout (sidebar open)
  - [ ] Mobile layout (sidebar closed)
  - [ ] Sidebar navigation items
  - [ ] Footer component
  - [ ] Responsive behavior
- [ ] VoiceAssistant organism stories
  - [ ] IDLE state (ready)
  - [ ] LISTENING state (recording)
  - [ ] CONFIRMING state (processing)
  - [ ] NAVIGATING state (result)
  - [ ] Error states (no mic, no permission)
- [ ] Form component stories
  - [ ] Search input (default, focused, filled, error)
  - [ ] Theme toggle dropdown
  - [ ] Favorites list
  - [ ] All input states documented
- [ ] Atoms/molecules stories (6+ components)
  - [ ] Button (all variants: primary, secondary, ghost)
  - [ ] Input field (all states: default, focus, error, disabled)
  - [ ] Label and form group
  - [ ] Badge/tag component
  - [ ] Icon button
  - [ ] Loading spinner
- [ ] Accessibility notes
  - [ ] Each story notes a11y features
  - [ ] Keyboard navigation documented
  - [ ] ARIA attributes explained
- [ ] Interactive documentation
  - [ ] Controls for interactive props
  - [ ] Actions logged for events
  - [ ] Examples of usage
- [ ] Documentation page
  - [ ] Component API documented (props, types)
  - [ ] Usage guidelines
  - [ ] Do's and don'ts
  - [ ] Related components linked

#### Technical Details
- **Stories format:** ComponentStory<typeof Component>
- **Documentation:** MDX or Markdown
- **Patterns:** Atomic design structure (atoms, molecules, organisms)

#### Dependencies
- TD-301 (Storybook must be set up)
- TD-203 (Design tokens should be extracted)

#### Quality Gates
- **Pre-Commit:** Storybook builds without errors
- **Pre-PR:** Visual review of stories, no accessibility errors

#### Definition of Done
- [ ] All major components have stories
- [ ] Stories demonstrate all states and variants
- [ ] Documentation accessible in Storybook
- [ ] Team uses Storybook for component reference
- [ ] Designers can review implementation

#### Notes
- Stories should be used for component review, not replacing Figma
- Each story should be independent and runnable
- Include real data (not placeholder text) where possible

---

### Story TD-303: Design System Guide & Token Docs
**Effort:** 8 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 3

#### User Story
As a **design system architect**, I want to **create comprehensive design system documentation** so that **developers understand and follow design patterns**.

#### Acceptance Criteria
- [ ] Design System Guide created (`docs/design-system/README.md`)
  - [ ] Philosophy and principles
  - [ ] Component hierarchy (atoms, molecules, organisms)
  - [ ] Design token categories and usage
  - [ ] Color palette with accessibility info
  - [ ] Typography scale
  - [ ] Spacing scale
  - [ ] Breakpoints and responsive design
- [ ] Token documentation (`docs/design-system/TOKENS.md`)
  - [ ] All design token groups documented
  - [ ] Visual reference for colors
  - [ ] Code examples for each token
  - [ ] Do's and don'ts
  - [ ] Token naming conventions
- [ ] Component documentation (`docs/design-system/COMPONENTS.md`)
  - [ ] Component inventory
  - [ ] Links to Storybook stories
  - [ ] Usage guidelines
  - [ ] Accessibility features
  - [ ] Related components
- [ ] Accessibility guidelines (`docs/design-system/ACCESSIBILITY.md`)
  - [ ] WCAG AA requirements
  - [ ] Color contrast standards
  - [ ] Focus management best practices
  - [ ] Keyboard navigation patterns
  - [ ] Screen reader testing checklist
- [ ] Contributing guide (`docs/design-system/CONTRIBUTING.md`)
  - [ ] How to add new components
  - [ ] How to modify existing components
  - [ ] Storybook story template
  - [ ] Testing requirements
  - [ ] Code review checklist
- [ ] Living documentation
  - [ ] Auto-generated from tokens.json
  - [ ] Auto-generated from Storybook
  - [ ] Version history tracked
  - [ ] Changelog for design system updates

#### Technical Details
- **Format:** Markdown + Storybook auto-docs
- **Structure:** Nested docs in `docs/design-system/`
- **Automation:** Design tokens from `design-tokens.json`, stories from Storybook

#### Dependencies
- TD-203 (Design tokens extracted)
- TD-301, TD-302 (Storybook set up with stories)

#### Quality Gates
- **Pre-Commit:** Markdown syntax valid
- **Pre-PR:** Documentation complete and accurate

#### Definition of Done
- [ ] Design system documentation published
- [ ] All design tokens documented
- [ ] All components documented
- [ ] A11y guidelines accessible
- [ ] Contributing guide ready for new contributors

#### Notes
- This becomes the single source of truth for design decisions
- Documentation should be easy to search and navigate
- Keep guidelines concise and actionable

---

### Story TD-304: Semantic HTML Refactoring
**Effort:** 6 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 3

#### User Story
As a **frontend developer**, I want to **refactor components to use semantic HTML** so that **the app is accessible to screen readers and SEO-optimized**.

#### Acceptance Criteria
- [ ] Replace generic divs with semantic elements
  - [ ] `<header>` for page headers
  - [ ] `<nav>` for navigation
  - [ ] `<main>` for main content
  - [ ] `<aside>` for sidebar
  - [ ] `<section>` for logical sections
  - [ ] `<article>` for term details
  - [ ] `<footer>` for page footer
- [ ] Proper heading hierarchy
  - [ ] Each page has single `<h1>`
  - [ ] Headings nest properly (h1 → h2 → h3)
  - [ ] No skipped levels (h1 → h3)
  - [ ] Heading text is descriptive
- [ ] Form elements properly structured
  - [ ] `<label>` associated with `<input>` (htmlFor)
  - [ ] `<fieldset>` and `<legend>` for grouped controls
  - [ ] Required fields marked with aria-required
  - [ ] Error states linked via aria-describedby
- [ ] List elements
  - [ ] Navigation uses `<ul>/<li>`
  - [ ] Search results use `<ul>/<li>` or `<ol>`
  - [ ] Definition list for term details (dl/dt/dd)
- [ ] Validate semantic structure
  - [ ] No axe core errors
  - [ ] Screen reader tests pass
  - [ ] Keyboard navigation still works
- [ ] Visual validation
  - [ ] No visual regressions (semantic HTML has default styling)
  - [ ] Component appearance unchanged

#### Technical Details
- **Standard:** HTML5 semantic elements
- **Testing:** axe DevTools, NVDA, keyboard navigation
- **Browser support:** All modern browsers (use polyfills if needed)

#### Dependencies
- None (can be done independently)

#### Quality Gates
- **Pre-Commit:** axe-core validation
- **Pre-PR:** Visual regression testing, accessibility review

#### Definition of Done
- [ ] All components use semantic HTML
- [ ] Heading hierarchy correct
- [ ] No axe core semantic errors
- [ ] Screen reader navigation works
- [ ] Visual appearance preserved

#### Notes
- Semantic HTML is a foundation for accessibility
- Use WAI-ARIA only when semantic elements don't exist
- This improves SEO as a side benefit

---

### Story TD-305: Component Unit Tests
**Effort:** 12 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 3-4

#### User Story
As a **QA engineer**, I want to **write unit tests for all major components** so that **component behavior is reliable and regressions are caught**.

#### Acceptance Criteria
- [ ] Card component tests
  - [ ] Render with all required props
  - [ ] Display term, category, description
  - [ ] Category color applied correctly
  - [ ] Favorite toggle works
  - [ ] Link to term detail works
  - [ ] All 6 category colors render correctly
  - [ ] Dark mode variant works
  - [ ] Coverage: > 90%
- [ ] Layout component tests
  - [ ] Render main layout structure
  - [ ] Sidebar navigation items render
  - [ ] VoiceAssistant modal opens/closes
  - [ ] Mobile responsive layout
  - [ ] Footer displayed
  - [ ] Coverage: > 85%
- [ ] Form components tests
  - [ ] Search input: type, focus, clear
  - [ ] Theme toggle: switch themes
  - [ ] Favorites list: render list, remove item
  - [ ] Input validation
  - [ ] Coverage: > 85%
- [ ] Page component integration tests
  - [ ] Dashboard page renders and loads terms
  - [ ] Term detail page displays term data
  - [ ] Navigation between pages works
  - [ ] History updates on navigation
  - [ ] Coverage: > 80%
- [ ] Accessibility component tests
  - [ ] Focus management in modals
  - [ ] ARIA attributes present
  - [ ] Keyboard navigation works
  - [ ] Color contrast not tested here (WCAG audit covers)
- [ ] Test quality
  - [ ] Tests are readable and maintainable
  - [ ] Mocking strategy consistent
  - [ ] No flaky tests (run 10x passes)
  - [ ] Tests follow patterns from TD-205

#### Technical Details
- **Framework:** Vitest + React Testing Library
- **Mocking:** Mock API calls, localStorage, Supabase
- **Test pattern:** Arrange-Act-Assert (AAA)

#### Dependencies
- TD-105 (Testing framework)
- TD-205 (Test patterns established)

#### Quality Gates
- **Pre-Commit:** Tests pass, coverage maintained
- **Pre-PR:** Coverage report shows > 80% average

#### Definition of Done
- [ ] Component tests merged to main
- [ ] Coverage > 80% for all tested components
- [ ] All tests passing consistently
- [ ] No flaky tests identified
- [ ] Developers follow test patterns for new components

#### Notes
- Test behavior, not implementation
- Use user-centric queries (getByRole, getByLabelText)
- Mock external dependencies (API, localStorage, Supabase)

---

### Story TD-306: VoiceAssistant Component Refactoring
**Effort:** 8 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 4

#### User Story
As a **frontend developer**, I want to **refactor VoiceAssistant component using extracted hooks** so that **the component is simple and the audio logic is reusable**.

#### Acceptance Criteria
- [ ] VoiceAssistant refactored using new hooks
  - [ ] Use `useAudioRecording` hook
  - [ ] Use `useAudioPlayback` hook
  - [ ] Component size: < 250 lines (from 477)
  - [ ] Same functionality, cleaner code
  - [ ] All tests passing
- [ ] State management simplified
  - [ ] State machine: IDLE → LISTENING → CONFIRMING → NAVIGATING
  - [ ] Transitions use extracted hooks
  - [ ] Error handling consistent
- [ ] Component API clean
  - [ ] Props clearly defined
  - [ ] No internal state leaking to parent
  - [ ] Easy to test and understand
- [ ] Accessibility maintained
  - [ ] Keyboard shortcut still works
  - [ ] Screen reader announcements present
  - [ ] Focus management correct
  - [ ] ARIA attributes appropriate
- [ ] Visual appearance unchanged
  - [ ] All UI elements present
  - [ ] Animations smooth
  - [ ] Responsive behavior maintained
  - [ ] Dark mode still works
- [ ] Stories and tests updated
  - [ ] Storybook stories for TD-302 updated
  - [ ] Component tests updated for refactored code
  - [ ] All tests passing

#### Technical Details
- **Dependencies:** useAudioRecording, useAudioPlayback (from TD-208)
- **Framework:** React hooks pattern
- **Testing:** Component tests (TD-305) should cover

#### Dependencies
- TD-208 (Audio hooks must be extracted first)
- TD-105 (Testing framework)

#### Quality Gates
- **Pre-Commit:** TypeScript validation, tests passing
- **Pre-PR:** Code review, no regression in voice functionality

#### Definition of Done
- [ ] VoiceAssistant refactored and tested
- [ ] Component < 250 lines
- [ ] All functionality preserved
- [ ] No regression in voice features
- [ ] Documentation updated

#### Notes
- This is a refactoring story (same functionality, better code)
- Demonstrates power of extracted hooks
- Sets pattern for future component improvements

---

### Story TD-307: Avatar Optimization & WebP Conversion
**Effort:** 2 hours | **Priority:** P2 - MEDIUM | **Sprint:** Phase 3, Week 4

#### User Story
As a **frontend developer**, I want to **optimize avatar images** so that **page load performance is improved**.

#### Acceptance Criteria
- [ ] Avatar image analysis
  - [ ] Current total size: 6 avatar PNG files
  - [ ] Compress existing PNG files (lossless)
  - [ ] Estimated size reduction: 30-40%
- [ ] WebP conversion
  - [ ] Convert all avatars to WebP format (smaller)
  - [ ] Maintain PNG fallback for older browsers
  - [ ] Use `<picture>` element for format selection
  - [ ] Estimated additional size reduction: 50%+
- [ ] Lazy loading
  - [ ] Avatar images lazy-loaded on demand
  - [ ] Only load when component visible
  - [ ] Use native `loading="lazy"` attribute
- [ ] Validation
  - [ ] Visual appearance identical (no quality loss)
  - [ ] Performance improvement measured (< 5KB total avatars)
  - [ ] Browser compatibility verified
- [ ] Documentation
  - [ ] Avatar optimization documented
  - [ ] Image serving strategy documented

#### Technical Details
- **Tools:** ImageOptim, cwebp, or online converters
- **Format:** WebP + PNG fallback
- **Implementation:** Picture element or CSS

#### Dependencies
- None (independent optimization)

#### Quality Gates
- **Pre-Commit:** Image quality verified
- **Pre-PR:** Performance metrics compared

#### Definition of Done
- [ ] Avatars optimized and converted
- [ ] Total avatar size < 5KB
- [ ] Performance improvement documented
- [ ] No visual regression
- [ ] Browser compatibility confirmed

#### Notes
- This is a quick optimization win
- Can be done in parallel with larger Phase 3 work
- Sets pattern for future image optimization

---

### Story TD-308: Design System Quality Validation
**Effort:** 4 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 3, Week 4

#### User Story
As a **project manager**, I want to **validate design system completeness and quality** so that **we're ready to use it for future feature development**.

#### Acceptance Criteria
- [ ] Design system completeness audit
  - [ ] All tokens documented and exported
  - [ ] All components have stories
  - [ ] All components have accessibility info
  - [ ] All pages use design system components
  - [ ] No hardcoded styles outside design system
- [ ] Code quality validation
  - [ ] No CodeRabbit critical findings in design system code
  - [ ] TypeScript strict mode passes
  - [ ] ESLint no errors
  - [ ] Test coverage > 80% for components
- [ ] Design consistency validation
  - [ ] Visual consistency audit (design vs code)
  - [ ] Color usage consistent
  - [ ] Typography consistent
  - [ ] Spacing consistent
  - [ ] Component patterns consistent
- [ ] Accessibility validation
  - [ ] WCAG AA compliance verified (Storybook a11y addon)
  - [ ] Keyboard navigation tested (all components)
  - [ ] Screen reader tested (sample components)
  - [ ] Color contrast verified (all text)
- [ ] Documentation completeness
  - [ ] Design system guide published
  - [ ] Token docs complete
  - [ ] Component docs complete
  - [ ] A11y guidelines complete
  - [ ] Contributing guide ready
- [ ] Team readiness
  - [ ] Team trained on design system
  - [ ] Developers confident using tokens/components
  - [ ] Designers confident reviewing Storybook
  - [ ] No blockers for Phase 4

#### Technical Details
- **Audit:** Manual review + automated tools
- **Tools:** Storybook a11y addon, WAVE, axe DevTools
- **Documentation:** Markdown + Storybook

#### Dependencies
- TD-301, TD-302, TD-303 (Design system components and docs)
- TD-305 (Component tests)
- TD-204 (A11y audit)

#### Quality Gates
- **Pre-execution:** Design system complete
- **Post-validation:** Sign-off from @architect and @ux-expert

#### Definition of Done
- [ ] Design system audit complete
- [ ] All findings documented
- [ ] Remediation plan for any issues
- [ ] Team trained and confident
- [ ] Approval from design and architecture leads
- [ ] Ready for Phase 4 (Performance & Security)

#### Notes
- This is a validation/gating story
- Ensures quality before scaling development
- Prevents technical debt accumulation

---

## PHASE 4: Performance, Security & Polish (Weeks 4-5) - 70 hours

### Story TD-401: Tailwind v4 Migration
**Effort:** 12 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 4, Week 4

#### User Story
As a **frontend developer**, I want to **migrate from Tailwind CDN to locally-installed v4** so that **CSS is tree-shaken and bundle size is optimized**.

#### Acceptance Criteria
- [ ] Tailwind v4 installed locally
  - [ ] `npm install -D tailwindcss@latest postcss autoprefixer`
  - [ ] `tailwind.config.ts` created
  - [ ] `postcss.config.cjs` created
- [ ] CSS processing pipeline configured
  - [ ] Input CSS file: `src/index.css`
  - [ ] Import: `@tailwind base, components, utilities`
  - [ ] PostCSS processes to compiled CSS
  - [ ] Vite imports compiled CSS
- [ ] Tailwind config migrated
  - [ ] All custom colors from design tokens moved to config
  - [ ] All custom spacing moved
  - [ ] All custom typography moved
  - [ ] Plugin configurations preserved
  - [ ] Custom CSS classes migrated
- [ ] Custom CSS merged with Tailwind
  - [ ] Glass morphism utilities preserved
  - [ ] Custom animations preserved
  - [ ] Custom shadows preserved
  - [ ] All custom styles working
- [ ] Build verification
  - [ ] Production build tested
  - [ ] CSS file size: < 50KB (gzipped, was 250KB)
  - [ ] No unused CSS
  - [ ] Tree-shaking working
- [ ] Browser testing
  - [ ] All pages render correctly
  - [ ] All colors correct
  - [ ] All spacing correct
  - [ ] All typography correct
  - [ ] Animations smooth
  - [ ] Dark mode working
- [ ] CDN script removed
  - [ ] Remove Tailwind CDN script tag from `index.html`
  - [ ] Remove any other CDN dependencies
  - [ ] Verify no fallback needed
- [ ] Performance validation
  - [ ] Page load time measured (before/after)
  - [ ] LCP improved (target: < 2.5s)
  - [ ] Bundle size reduced (target: < 50KB CSS)
  - [ ] No performance regressions

#### Technical Details
- **Tool:** Tailwind CSS v4 (latest)
- **Build:** Vite CSS processing
- **Optimization:** Tree-shaking + minification
- **Fallback:** None (all CSS locally generated)

#### Dependencies
- TD-203 (Design tokens help with config migration)

#### Quality Gates
- **Pre-Commit:** CSS builds without errors
- **Pre-PR:** Bundle size verified, visual regression tested

#### Definition of Done
- [ ] Tailwind v4 deployed to main
- [ ] CSS file size < 50KB
- [ ] All visual appearance preserved
- [ ] Performance improvement documented
- [ ] Team trained on new CSS pipeline

#### Notes
- This is a significant improvement (250KB → 50KB CSS)
- No visual changes expected (same output)
- Enables future Tailwind plugin integrations

---

### Story TD-402: API Key Backend Proxy
**Effort:** 12 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 4, Week 4

#### User Story
As a **security engineer**, I want to **move API keys to backend and create proxy** so that **API keys are never exposed in frontend JavaScript**.

#### Acceptance Criteria
- [ ] Backend API routes created
  - [ ] Route: `POST /api/v1/terms/generate`
  - [ ] Route: `POST /api/v1/terms/seed`
  - [ ] Routes accept request body and delegate to Gemini API
  - [ ] Routes validate input (no code injection)
  - [ ] Routes return sanitized responses
- [ ] Gemini API integration moved to backend
  - [ ] Backend calls Gemini (not frontend)
  - [ ] API key stored in `GEMINI_API_KEY` env var
  - [ ] Never logged or exposed in error messages
- [ ] Frontend API client updated
  - [ ] `src/services/termService.ts` calls backend routes
  - [ ] Frontend never handles Gemini API key
  - [ ] Error handling preserves user-friendly messages
  - [ ] Rate limiting enforced on backend
- [ ] Build validation
  - [ ] Production build has no API keys in `dist/`
  - [ ] Env vars properly injected at runtime
  - [ ] Secrets scan passes (no keys in source)
  - [ ] Source maps don't expose keys
- [ ] Security validation
  - [ ] CodeRabbit security scan passes
  - [ ] Manual security review of proxy code
  - [ ] Rate limiting prevents abuse
  - [ ] Input validation prevents injection
- [ ] Testing
  - [ ] Backend routes tested with valid/invalid input
  - [ ] Error responses don't expose sensitive info
  - [ ] Integration tests with frontend
  - [ ] Performance acceptable (no significant latency)
- [ ] Monitoring
  - [ ] Backend route calls logged to Sentry
  - [ ] Rate limit violations logged
  - [ ] Error rates monitored
- [ ] Deployment
  - [ ] Backend API documented
  - [ ] Frontend migration complete
  - [ ] No breaking changes to API
  - [ ] Backward compatible if possible

#### Technical Details
- **Backend framework:** Depends on stack (Node.js/Express assumed)
- **API pattern:** RESTful JSON endpoints
- **Security:** Input validation, output sanitization, rate limiting
- **Logging:** Sentry + access logs (no secrets)

#### Dependencies
- None (can be implemented independently)

#### Quality Gates
- **Pre-Commit:** Security scan passes, no API keys in code
- **Pre-PR:** Security review by @architect, rate limiting tested
- **Pre-Deploy:** Production security audit passes

#### Definition of Done
- [ ] Backend proxy implemented and tested
- [ ] Frontend migrated to use proxy
- [ ] API keys completely removed from frontend
- [ ] Security validation passed
- [ ] Performance acceptable
- [ ] Deployment successful
- [ ] Documentation published

#### Notes
- This is a critical security fix
- Must be completed before production deployment
- No user-visible changes (same API interface)
- Enables future API expansion

---

### Story TD-403: Admin Authentication Hardening
**Effort:** 8 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 4, Week 4

#### User Story
As a **security engineer**, I want to **implement strong admin authentication** so that **only authorized users can modify content**.

#### Acceptance Criteria
- [ ] Current auth audit
  - [ ] Identify current authentication mechanism
  - [ ] Document weak areas (plain-text passwords, etc.)
  - [ ] Document current access control
- [ ] Strong authentication implemented
  - [ ] Option 1: OAuth (Google, GitHub)
    - [ ] OAuth provider configured
    - [ ] OAuth flow implemented
    - [ ] Tokens securely stored
    - [ ] Refresh token rotation
  - [ ] Option 2: JWT with strong secrets
    - [ ] JWT issuer/validator configured
    - [ ] Secret key ≥ 32 bytes
    - [ ] Token expiration: 1 hour
    - [ ] Refresh token: 7 days
    - [ ] Token rotation on login
- [ ] Admin role implementation
  - [ ] Role-based access control (RBAC)
  - [ ] Admin role defined in Supabase Auth
  - [ ] Admin-only endpoints protected
  - [ ] Admin UI requires authentication
  - [ ] Session timeout: 1 hour inactivity
- [ ] Password policy (if using passwords)
  - [ ] Minimum 12 characters
  - [ ] Require uppercase, lowercase, digits, symbols
  - [ ] No dictionary words
  - [ ] No reuse of last 5 passwords
  - [ ] Password change required on first login
- [ ] Audit logging
  - [ ] All admin actions logged
  - [ ] Who, what, when, where recorded
  - [ ] Logs immutable (append-only)
  - [ ] Retention: 90 days minimum
  - [ ] Logs accessible to admins only
- [ ] Monitoring and alerts
  - [ ] Failed login attempts logged
  - [ ] Multiple failed attempts trigger lock
  - [ ] Suspicious activity alerts admins
  - [ ] Rate limiting prevents brute force
- [ ] Testing
  - [ ] OAuth flow tested end-to-end
  - [ ] Token refresh tested
  - [ ] Session expiration tested
  - [ ] Audit logging tested
  - [ ] Unauthorized access blocked
- [ ] Documentation
  - [ ] Admin login procedure documented
  - [ ] Password policy documented
  - [ ] OAuth setup documented (for ops team)
  - [ ] Troubleshooting guide

#### Technical Details
- **Auth provider:** Supabase Auth (or external OAuth)
- **Token format:** JWT (standard claims)
- **Storage:** Secure HTTP-only cookies (no localStorage)
- **Transport:** HTTPS only
- **Encryption:** TLS 1.3 for all connections

#### Dependencies
- None (can be implemented independently)

#### Quality Gates
- **Pre-Commit:** Security scan passes, no hardcoded secrets
- **Pre-PR:** Security review by @architect, penetration test
- **Pre-Deploy:** Admin sign-off on authentication flow

#### Definition of Done
- [ ] Strong authentication implemented
- [ ] OAuth or JWT working
- [ ] Admin-only access controlled
- [ ] Audit logging operational
- [ ] Security validation passed
- [ ] Team trained on new auth
- [ ] Documentation published
- [ ] Deployment successful

#### Notes
- This is a critical security improvement
- OAuth is preferred (less maintenance, stronger)
- JWT alternative if OAuth not available
- Audit logging essential for compliance

---

### Story TD-404: Performance Optimization & Metrics
**Effort:** 12 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 4, Week 4

#### User Story
As a **architect**, I want to **optimize application performance** so that **page loads in < 2.5s and interaction is snappy**.

#### Acceptance Criteria
- [ ] Performance baseline established
  - [ ] Lighthouse audit run (desktop + mobile)
  - [ ] Core Web Vitals measured (LCP, FID, CLS)
  - [ ] Network waterfall analyzed
  - [ ] Rendering performance profiled
  - [ ] Baseline documented
- [ ] Optimization opportunities identified
  - [ ] JavaScript code splitting analyzed
  - [ ] CSS optimization reviewed
  - [ ] Image optimization reviewed
  - [ ] Font loading optimized
  - [ ] Caching strategy reviewed
  - [ ] Compression enabled
- [ ] Code splitting implemented
  - [ ] Route-based code splitting (lazy routes)
  - [ ] Component lazy loading (if heavy components)
  - [ ] Webpack bundle analysis reviewed
  - [ ] Main bundle: < 150KB (gzipped)
  - [ ] Route chunks: < 50KB each
- [ ] Image optimization
  - [ ] Next-gen formats (WebP) with fallback
  - [ ] Responsive images (srcset)
  - [ ] Lazy loading on off-screen images
  - [ ] Placeholder/blur-up strategy
  - [ ] Total images < 100KB
- [ ] Font optimization
  - [ ] System fonts or self-hosted fonts (no Google CDN delay)
  - [ ] Font subsetting for used characters only
  - [ ] font-display: swap for better UX
  - [ ] Font size < 50KB total
- [ ] Caching strategy
  - [ ] Service Worker for offline support (or cache headers)
  - [ ] Cache busting for CSS/JS (hash-based)
  - [ ] Browser cache headers configured
  - [ ] Stale-while-revalidate for API responses
  - [ ] Data cache in IndexedDB (optional)
- [ ] Rendering performance
  - [ ] React reconciliation optimized (memoization, keys)
  - [ ] Unnecessary re-renders eliminated
  - [ ] Layouts optimized (no layout thrashing)
  - [ ] Paint performance good (60fps target)
  - [ ] Long tasks broken up (< 50ms)
- [ ] Performance metrics dashboard
  - [ ] Real User Monitoring (RUM) set up (Sentry)
  - [ ] Core Web Vitals tracked
  - [ ] Performance budget monitored
  - [ ] Alerts for performance regression
  - [ ] Dashboards accessible to team
- [ ] Final validation
  - [ ] Lighthouse score ≥ 90 (all sections)
  - [ ] LCP < 2.5s (all routes)
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
  - [ ] Performance maintained under load
- [ ] Documentation
  - [ ] Performance optimization documented
  - [ ] Performance budget documented
  - [ ] Monitoring setup documented

#### Technical Details
- **Tools:** Lighthouse, WebPageTest, DevTools Performance
- **Monitoring:** Sentry RUM + Web Vitals
- **Framework:** React optimizations (memoization, suspense)
- **Bundler:** Vite (already good, but further optimization)

#### Dependencies
- TD-401 (Tailwind optimization complete)
- TD-307 (Image optimization done)

#### Quality Gates
- **Pre-commit:** Lighthouse audit passing locally
- **Pre-PR:** Performance metrics reviewed
- **Pre-deploy:** Performance target met

#### Definition of Done
- [ ] Performance targets met (LCP < 2.5s, etc.)
- [ ] Performance dashboard operational
- [ ] Team trained on performance monitoring
- [ ] Documentation published
- [ ] Alerts configured for regressions

#### Notes
- Performance is ongoing optimization (not one-time)
- Monitor real user metrics (not just lab)
- Set performance budget and enforce in CI

---

### Story TD-405: Integration Tests & E2E
**Effort:** 12 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 4, Week 5

#### User Story
As a **QA engineer**, I want to **write integration and end-to-end tests** so that **critical user flows are verified and regressions are caught**.

#### Acceptance Criteria
- [ ] Integration tests for critical flows
  - [ ] Flow: Search term → Display result → Add to favorites
  - [ ] Flow: Search term → View full detail → Navigate back
  - [ ] Flow: Switch theme → Verify persistence → Reload
  - [ ] Flow: Clear history → Verify history empty
  - [ ] Flow: API error → Error message shown
  - [ ] Coverage: > 80% of critical paths
- [ ] E2E tests using Playwright/Cypress
  - [ ] Setup: E2E test framework configured
  - [ ] Test: User can search for terms (complete flow)
  - [ ] Test: Favorites list updates when term added
  - [ ] Test: Responsive design works on mobile
  - [ ] Test: Dark mode toggle switches theme
  - [ ] Test: VoiceAssistant can be activated (mock microphone)
- [ ] Test data management
  - [ ] Test database seeded with sample data
  - [ ] Test data isolated (no cross-test pollution)
  - [ ] Cleanup procedures run between tests
  - [ ] Test data includes edge cases
- [ ] Continuous Integration
  - [ ] Tests run on every PR
  - [ ] Tests run before deployment
  - [ ] Failure blocks deployment
  - [ ] Results reported in PR comment
- [ ] Performance testing (basic)
  - [ ] Test page load time < 3s
  - [ ] Test interaction response time < 100ms
  - [ ] Test no memory leaks (basic check)
- [ ] Accessibility testing
  - [ ] Axe accessibility check in E2E
  - [ ] Keyboard navigation tested
  - [ ] Screen reader compatibility (basic)
- [ ] Monitoring
  - [ ] Test failures logged
  - [ ] Flaky tests identified (run multiple times)
  - [ ] Test performance tracked
- [ ] Documentation
  - [ ] E2E test guide created
  - [ ] How to write tests documented
  - [ ] Test data setup documented
  - [ ] CI/CD integration documented

#### Technical Details
- **Framework:** Vitest (integration) + Playwright or Cypress (E2E)
- **Test data:** Seed with real-ish data
- **Browser coverage:** Chrome, Firefox, Safari (if resources allow)
- **CI:** GitHub Actions or existing CI system

#### Dependencies
- TD-105 (Testing framework set up)
- TD-305 (Component tests as foundation)

#### Quality Gates
- **Pre-commit:** Tests pass locally
- **Pre-PR:** Tests pass in CI, coverage maintained
- **Pre-deploy:** All tests passing, no flaky tests

#### Definition of Done
- [ ] Integration and E2E tests written
- [ ] Tests pass consistently
- [ ] No flaky tests identified
- [ ] CI integration working
- [ ] Team comfortable with E2E testing
- [ ] Documentation published

#### Notes
- Start with critical user paths (high ROI)
- E2E tests are slower, so keep count reasonable (< 50 tests)
- Regular test maintenance (remove flaky, update for changes)
- Balance between coverage and speed

---

### Story TD-406: Security Audit & Vulnerability Scan
**Effort:** 6 hours | **Priority:** P0 - CRITICAL | **Sprint:** Phase 4, Week 5

#### User Story
As a **security engineer**, I want to **conduct comprehensive security audit** so that **vulnerabilities are identified and remediated before production**.

#### Acceptance Criteria
- [ ] Code security scan
  - [ ] CodeRabbit security review of all code
  - [ ] Focus on: SQL injection, XSS, CSRF, insecure deserialization
  - [ ] Zero CRITICAL findings
  - [ ] All HIGH findings remediated or documented
- [ ] Dependency vulnerability scan
  - [ ] npm audit run on all dependencies
  - [ ] npm audit fix applied
  - [ ] Zero CRITICAL vulnerabilities
  - [ ] All HIGH vulnerabilities remediated
  - [ ] Vulnerable dependencies updated or removed
- [ ] Secrets scanning
  - [ ] No API keys in source code
  - [ ] No passwords in config files
  - [ ] No database credentials in logs
  - [ ] Pre-commit hook prevents secret commits
  - [ ] git-secrets or similar configured
- [ ] OWASP Top 10 validation
  - [ ] A01: Broken Access Control → RLS policies, auth
  - [ ] A02: Cryptographic Failures → HTTPS, secrets management
  - [ ] A03: Injection → Input validation, parameterized queries
  - [ ] A04: Insecure Design → Security requirements in spec
  - [ ] A05: Security Misconfiguration → Minimal config, secure defaults
  - [ ] A06: Vulnerable Components → Dependency scanning
  - [ ] A07: Authentication Failures → Strong auth, session management
  - [ ] A08: Software/Data Integrity → Version control, checksums
  - [ ] A09: Logging/Monitoring Failures → Error tracking, audit logs
  - [ ] A10: SSRF → Input validation, allowlist for URLs
- [ ] Data security validation
  - [ ] Sensitive data encrypted at rest (if stored)
  - [ ] Sensitive data encrypted in transit (HTTPS)
  - [ ] PII redaction in logs
  - [ ] Data retention policy defined
  - [ ] GDPR/CCPA compliance (if applicable)
- [ ] API security validation
  - [ ] API authentication required
  - [ ] API rate limiting configured
  - [ ] API authorization validated
  - [ ] API input validation comprehensive
  - [ ] API error messages don't expose sensitive info
- [ ] Infrastructure security
  - [ ] HTTPS/TLS configured and enforced
  - [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
  - [ ] CORS policy restrictive
  - [ ] Environment variables secured
  - [ ] Database access restricted
  - [ ] No public URLs for admin endpoints
- [ ] Penetration testing (basic)
  - [ ] Manual testing for common vulnerabilities
  - [ ] Attempt unauthorized access
  - [ ] Test API rate limiting
  - [ ] Test RLS policies
  - [ ] Test error messages
- [ ] Audit report
  - [ ] Document all findings
  - [ ] Severity levels assigned
  - [ ] Remediation plans created
  - [ ] Timeline for fixes established
  - [ ] Sign-off from security reviewer
- [ ] Monitoring and alerting
  - [ ] Security events logged
  - [ ] Alerts configured for suspicious activity
  - [ ] Incident response plan created
  - [ ] Team trained on security procedures

#### Technical Details
- **Code scanning:** CodeRabbit, SonarQube, or similar
- **Dependency scanning:** npm audit, Snyk, or similar
- **Secrets scanning:** git-secrets, TruffleHog, or similar
- **SAST:** Static analysis tools integrated in CI
- **DAST:** Dynamic analysis (if budget allows)

#### Dependencies
- TD-402 (API security proxy should be in place)
- TD-403 (Admin authentication hardened)

#### Quality Gates
- **Pre-execution:** Security audit scheduled
- **Post-audit:** All CRITICAL findings remediated
- **Pre-deploy:** Security sign-off obtained

#### Definition of Done
- [ ] Security audit completed
- [ ] All CRITICAL findings fixed
- [ ] All HIGH findings documented with remediation plan
- [ ] Audit report published (redacted for public)
- [ ] Team trained on security best practices
- [ ] Monitoring alerts configured

#### Notes
- Security is ongoing, not one-time
- Regular audits recommended (quarterly)
- Include third-party security review if budget allows
- Document security decisions for future reference

---

### Story TD-407: Production Monitoring Setup
**Effort:** 8 hours | **Priority:** P1 - HIGH | **Sprint:** Phase 4, Week 5

#### User Story
As a **DevOps engineer**, I want to **establish production monitoring and alerting** so that **issues are detected and resolved quickly**.

#### Acceptance Criteria
- [ ] Error tracking (already set up in TD-106)
  - [ ] Sentry configured and monitoring
  - [ ] Critical errors trigger alerts
  - [ ] Error trends visible in dashboard
- [ ] Performance monitoring
  - [ ] Core Web Vitals tracked (RUM)
  - [ ] Performance metrics dashboard created
  - [ ] Alerts for performance regression (LCP > 3s)
  - [ ] End-user performance visible
- [ ] Uptime monitoring
  - [ ] Health check endpoint configured
  - [ ] Uptime monitor checking endpoint every 60s
  - [ ] Downtime alerts to ops team
  - [ ] Historical uptime data tracked
- [ ] Database monitoring
  - [ ] Query performance tracked
  - [ ] Slow query log analyzed
  - [ ] Connection pool usage monitored
  - [ ] Disk usage tracked
  - [ ] Backup status verified daily
- [ ] Security monitoring
  - [ ] Rate limit violations tracked
  - [ ] Failed login attempts logged
  - [ ] Suspicious activity detected
  - [ ] Security events dashboarded
- [ ] Infrastructure monitoring (if applicable)
  - [ ] CPU usage monitored
  - [ ] Memory usage monitored
  - [ ] Disk space monitored
  - [ ] Network performance monitored
  - [ ] Alerts for resource exhaustion
- [ ] Log aggregation
  - [ ] All application logs centralized
  - [ ] Logs searchable and indexed
  - [ ] Log retention: 30 days minimum
  - [ ] Sensitive data redacted
  - [ ] Log-based alerting configured
- [ ] Dashboards created
  - [ ] Operations dashboard (uptime, errors, performance)
  - [ ] Business dashboard (user activity, search trends)
  - [ ] Security dashboard (failed logins, rate limits)
  - [ ] Team access to dashboards
  - [ ] Mobile-friendly views
- [ ] Alerting rules
  - [ ] CRITICAL: Service down → Immediate page/alert
  - [ ] CRITICAL: Error rate > 5% → Alert to team
  - [ ] HIGH: LCP > 3s → Alert to performance team
  - [ ] HIGH: Database connection errors → Alert to DBA
  - [ ] MEDIUM: Disk usage > 80% → Alert to ops
  - [ ] INFO: Daily summary email with metrics
- [ ] On-call procedures
  - [ ] On-call schedule defined
  - [ ] Escalation procedures documented
  - [ ] Incident response plan created
  - [ ] Runbooks for common issues
  - [ ] Team trained on procedures
- [ ] Testing
  - [ ] Alert tested (triggered and received)
  - [ ] Monitoring data accuracy verified
  - [ ] Dashboard data up-to-date
  - [ ] No false alarms
- [ ] Documentation
  - [ ] Monitoring setup documented
  - [ ] Dashboard guides for team
  - [ ] Alert procedures documented
  - [ ] Troubleshooting guides created
  - [ ] On-call handbook created

#### Technical Details
- **Error tracking:** Sentry (already configured)
- **Performance:** Sentry RUM + Web Vitals
- **Uptime:** UptimeRobot, Pingdom, or similar
- **Logs:** Cloud provider logs (if serverless) or ELK
- **Infrastructure:** Cloud provider monitoring (AWS CloudWatch, etc.)
- **Dashboards:** Grafana, DataDog, or cloud provider dashboards

#### Dependencies
- TD-106 (Error tracking must be set up)
- TD-404 (Performance metrics established)

#### Quality Gates
- **Pre-execution:** Monitoring requirements defined
- **Pre-deploy:** All dashboards accessible
- **Post-deployment:** Monitoring verified operational

#### Definition of Done
- [ ] Monitoring systems operational
- [ ] All dashboards live and accessible
- [ ] Alerting rules active and tested
- [ ] Team trained on monitoring tools
- [ ] On-call procedures documented
- [ ] Incident response plan activated

#### Notes
- Monitoring is ongoing responsibility (not set-and-forget)
- Regular review and refinement of alert thresholds
- Collect data for capacity planning
- Integrate with incident management (if applicable)

---

## PHASE 5-6: Optimization & Hardening (Weeks 6-10) - 52 hours

These stories are lower priority and can be worked on in parallel with earlier phases or deferred to future iterations.

### Story TD-501: Service Worker & Offline Support
**Effort:** 8 hours | **Priority:** P2 - MEDIUM

### Story TD-502: Full-Text Search Implementation
**Effort:** 4 hours | **Priority:** P2 - MEDIUM

### Story TD-503: localStorage Optimization
**Effort:** 2 hours | **Priority:** P2 - MEDIUM

### Story TD-504: Animation Standardization
**Effort:** 2 hours | **Priority:** P2 - MEDIUM

### Story TD-505: Expanded Test Coverage (80%+)
**Effort:** 16 hours | **Priority:** P2 - MEDIUM

### Story TD-506: Advanced Performance Tuning
**Effort:** 12 hours | **Priority:** P2 - MEDIUM

### Story TD-507: Documentation Expansion
**Effort:** 8 hours | **Priority:** P2 - MEDIUM

---

## Summary

**Total Stories:** 24
**Total Effort:** 290 hours
**Timeline:** 8-10 weeks
**Team Size:** 4 people
**Cost:** ~$17,400 @ $60/hr

**Ready for:**
- @sm (River) to create detailed user story cards
- @po (Pax) to prioritize and estimate
- Sprint planning and kickoff

---

**Prepared by:** @pm (Morgan)
**Status:** 🟢 Ready for Sprint Planning
**Next:** @sm creates detailed story cards with AC, @po validates

