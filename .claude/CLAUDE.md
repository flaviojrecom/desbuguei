# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Desbuquei** is an interactive technical glossary application built with React and Vite. It provides AI-powered definitions of technology terms in Portuguese, with business-focused explanations, examples, analogies, and practical usage contexts. The app features voice assistance, theme customization, term favorites, and search history.

**Tech Stack:**
- React 19 with TypeScript
- Vite (build tool)
- React Router for navigation
- Google Gemini API for AI-powered term generation
- Supabase for term data persistence
- HashRouter (enables deployment without server routing)
- **Synkra AIOS**: AI-Orchestrated System for Full Stack Development (see AIOS Framework section below)

## Critical Working Principles

### NEVER
- Implement without showing options first (always present as 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one item first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix it)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in `squads/`

### ALWAYS
- Present options as "1. X, 2. Y, 3. Z" format
- Use `AskUserQuestion` tool for clarifications
- Check `squads/` and existing components before creating new ones
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in `docs/sessions/YYYY-MM/` at end of session

---

## Synkra AIOS Framework

This project uses **Synkra AIOS**, a meta-framework that orchestrates AI agents to handle complex development workflows.

### Agent System

#### Agent Activation
- Agents are activated with `@agent-name` syntax: `@dev`, `@qa`, `@architect`, `@pm`, `@po`, `@sm`, `@analyst`
- The master agent is activated with `@aios-master`
- Agent commands use the `*` prefix: `*help`, `*create-story`, `*task`, `*exit`

#### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

### Story-Driven Development

All development must follow the story-driven methodology:

1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: `[ ]` → `[x]`
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### AIOS Framework Structure

```
aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

### Testing Requirements

- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

### Code Standards

- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

## Quick Start Commands

### Development
```bash
npm install                # Install dependencies
npm run dev                # Start dev server (port 3000)
npm run build              # Build for production
npm run preview            # Preview production build locally
```

### Environment Setup
Create `.env.local` with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

The app will work with just `VITE_GEMINI_API_KEY` (local fallback database available).

## Architecture & Code Structure

### Core Directory Structure
```
├── App.tsx                    # Main app component with routing
├── index.tsx                  # React DOM entry point
├── types.ts                   # TypeScript interfaces (TermData, etc.)
├── components/                # Reusable React components
│   ├── Layout.tsx            # Main layout wrapper
│   ├── Card.tsx              # Term card display component
│   └── VoiceAssistant.tsx    # Voice interaction system
├── pages/                     # Page components (route views)
│   ├── Dashboard.tsx         # Home/search page
│   ├── Glossary.tsx          # All terms view
│   ├── TermDetail.tsx        # Individual term details
│   ├── History.tsx           # Search/view history
│   ├── Favorites.tsx         # Saved favorite terms
│   └── Settings.tsx          # User preferences
├── context/                   # React Context for state management
│   ├── VoiceContext.tsx      # Voice API state and functions
│   ├── ThemeContext.tsx      # Theme (light/dark) state
│   ├── FavoritesContext.tsx  # Favorites list state
│   └── HistoryContext.tsx    # Search history state
├── services/                  # Business logic & API calls
│   ├── termService.ts        # Core term fetching and caching logic
│   └── supabase.ts           # Supabase client initialization
├── utils/                     # Utility functions
│   └── env.ts                # Environment variable helpers
└── data/                      # Static data
    └── characters.ts         # Avatar character data
```

### Key Concepts

**Term Data Flow:**
1. User searches/requests a term
2. `termService.getTermData()` checks in order:
   - Supabase database (if configured, read-through cache)
   - Local mock database (instant demo fallback)
   - Google Gemini API (generates new content with JSON schema)
   - Auto-saves result to Supabase for future requests
3. Component displays structured `TermData` with all fields

**TermData Interface** (see `types.ts`):
- `id`: Normalized identifier (e.g., "react-js")
- `term`: The actual term name
- `fullTerm`: English expansion
- `category`: Desenvolvimento, Infraestrutura, Dados & IA, Segurança, Agile & Produto
- `definition`: Business-focused Portuguese explanation
- `phonetic`: Pronunciation hint
- `slang`: Common variations (optional)
- `translation`: Portuguese essence
- `examples`: Array of 2 business-use examples
- `analogies`: Array of 2 simple analogies
- `practicalUsage`: Real-world usage scenario
- `relatedTerms`: Array of up to 6 related keywords

**State Management:**
- Context API used for global state (theme, voice, favorites, history)
- No Redux/Zustand—Context is sufficient for app scope
- LocalStorage likely used in context hooks for persistence

**Routing:**
- HashRouter (`/#/glossary`, `/#/term/api`, etc.)
- Enables static file deployment (GitHub Pages, Vercel)
- No backend routing required

### TermService Architecture

`termService.ts` implements **read-through caching**:
```
Query → Supabase (hit/miss) → Local Mock → Gemini API → Save to Supabase
```

Key functions:
- `getTermData(termId)`: Main fetch function with auto-caching
- `seedDatabase()`: Bulk populate DB with term list via Gemini
- `normalizeId()`: Slugify term names for consistent ID format

Important: ID normalization ("React JS" → "react-js") is critical for consistent lookups.

## Vite & Build Configuration

**vite.config.ts** sets:
- Server port: 3000
- React plugin enabled
- API key injection: `process.env.GEMINI_API_KEY` and `process.env.API_KEY`
- Path alias: `@/` resolves to project root

**tsconfig.json**:
- Target: ES2022
- Module resolution: bundler
- JSX: react-jsx
- Allows importing `.ts` extensions (Vite compatibility)

## Development Patterns

### Adding a New Page
1. Create component in `pages/NewPage.tsx`
2. Add route in `App.tsx` under `<Routes>`
3. Import and link from navigation (in `Layout.tsx` or `Dashboard.tsx`)

### Working with Context
1. Define interface in context file
2. Create context with `React.createContext<Type>()`
3. Create Provider component with state logic
4. Wrap app in Provider in `App.tsx`
5. Use `useContext()` hook in components

### Fetching Term Data
```typescript
import { getTermData } from '../services/termService';

const [term, setTerm] = useState<TermData | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchTerm = async () => {
    setLoading(true);
    try {
      const data = await getTermData('api');
      setTerm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  fetchTerm();
}, [termId]);
```

### Google Gemini Integration
- Uses `@google/genai` package
- Always request `responseMimeType: "application/json"` with schema for structured output
- Schema validation prevents AI hallucination on field names
- API key injected at build time from `.env.local`

## Common Development Tasks

### Adding a New Context
1. Create context file (e.g., `NotificationContext.tsx`)
2. Define interface for state and actions
3. Create context and Provider component
4. Add Provider to App.tsx root
5. Export hook for easy usage: `useNotifications()`

### Modifying Term Display
- Edit `Card.tsx` for card layout
- Edit `TermDetail.tsx` for detail page
- Update `TermData` interface in `types.ts` if adding new fields
- Update Gemini prompt in `termService.ts` if new AI-generated fields

### Debugging Gemini Responses
- Check browser console for JSON parse errors
- Verify schema matches response shape
- Use smaller/simpler prompts first to test
- Test with hardcoded mock data to isolate API issues

### Database Seeding
Call `seedDatabase()` from Settings page:
```typescript
await seedDatabase(console.log, ['Docker', 'Kubernetes', 'API']);
```
Saves list of terms via Gemini to Supabase for offline access.

## Important Implementation Notes

### ID Normalization
The `normalizeId()` function converts spaces/special chars to hyphens. This is critical:
- Supabase lookups use normalized IDs
- Local mock DB uses lowercase trimmed IDs
- Always normalize before Supabase queries

### LocalStorage & Context Persistence
Context providers should check localStorage on init:
```typescript
const [favorites, setFavorites] = useState<string[]>(() => {
  return JSON.parse(localStorage.getItem('favorites') ?? '[]');
});

useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);
```

### Supabase Optional
App works without Supabase (uses local mock database). This is intentional:
- Demo/local development doesn't require API keys
- Production should configure Supabase for persistence
- Check `isSupabaseConfigured()` before DB operations

### Voice Context
`VoiceContext.tsx` uses Web Speech API:
- Speech Recognition for input
- Speech Synthesis for output
- Gracefully degrades if browser doesn't support
- Pronunciation hints from `phonetic` field used for TTS

## AIOS Workflow Execution

### Task Execution Pattern
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows
- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

### AIOS-Specific Patterns

**Working with Templates**
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

**Agent Command Handling**
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

**Story Updates**
```javascript
// Update story progress
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```

## Git Conventions

Follow conventional commits:
```
feat: add new glossary page [Story X.X]
fix: normalize term IDs in database queries
docs: update README with setup instructions
refactor: simplify context initialization
```

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID when applicable
- Keep commits atomic and focused

### GitHub CLI Usage
- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

## Debugging Tips

### API Key Issues
- Verify `VITE_GEMINI_API_KEY` in `.env.local`
- Check browser console for "API Key not configured" error
- Environment variables must start with `VITE_` for Vite to inject them

### Supabase Connection
- If `isSupabaseConfigured()` returns false, check `.env.local` for Supabase keys
- Supabase errors are logged to console but don't crash app (graceful fallback to Gemini)
- Local mock DB always available as last resort

### Build Errors
- Run `npm run build` before deploying to catch TypeScript errors
- Vite strict mode catches unused imports and variables
- Check that all components are properly exported

## Deployment Notes

- Uses HashRouter for static hosting (GitHub Pages, Vercel, Netlify)
- Environment variables must be set in deployment platform (not in .env.local)
- `npm run build` outputs to `dist/` directory
- No backend server required

## Claude Code Specific Configuration

### Performance Optimization
- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines
- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the Task tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management
- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery
- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

### Testing Strategy
- Run tests incrementally during development
- Always verify lint and typecheck before marking complete
- Test edge cases for each new feature
- Document test scenarios in story files

### Documentation
- Update relevant docs when changing functionality
- Include code examples in documentation
- Keep README synchronized with actual behavior
- Document breaking changes prominently
