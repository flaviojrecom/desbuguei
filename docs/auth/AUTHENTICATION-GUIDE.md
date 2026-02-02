# Authentication & API Key Management Guide

**Story:** TD-104 - API Authentication & Security
**Version:** 1.0
**Last Updated:** 2026-02-02

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Admin Authentication](#admin-authentication)
4. [API Key Management](#api-key-management)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Development

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your API keys:**
   ```bash
   # Edit .env.local
   VITE_GEMINI_API_KEY=your-gemini-key-here
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Set admin password (one-time setup):**
   ```bash
   # Generate bcrypt hash of your password
   npx bcryptjs -r 10 "your-secure-password"

   # Copy hash to .env.local
   ADMIN_PASSWORD_HASH=$2b$10$...hash-here...
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access admin panel:**
   - Navigate to `http://localhost:3000/#/settings`
   - You'll be redirected to `/login`
   - Enter your admin password

---

## Environment Setup

### Environment Variables

All environment variables use `VITE_` prefix for Vite injection:

```env
# ====== REQUIRED ======
VITE_GEMINI_API_KEY=sk-proj-xxxxxxx...
# Google Gemini API key from: https://aistudio.google.com/apikey

# ====== OPTIONAL (for Supabase features) ======
VITE_SUPABASE_URL=https://your-project.supabase.co
# Supabase project URL from: Project Settings > Configuration > API

VITE_SUPABASE_ANON_KEY=eyJhbGc...
# Supabase anonymous key from: Project Settings > Configuration > API

# ====== MONITORING (optional) ======
VITE_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
# Sentry DSN from: https://sentry.io (for error tracking)

# ====== ADMIN (required for auth) ======
ADMIN_PASSWORD_HASH=$2b$10$...bcrypt-hash...
# Generated with: npx bcryptjs -r 10 "your-password"
```

### Getting API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key to `VITE_GEMINI_API_KEY`

#### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > Configuration > API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Admin Authentication

### Login Flow

1. **Navigate to Settings:**
   - Click Settings in the left sidebar
   - You'll be redirected to `/login` if not authenticated

2. **Enter Admin Password:**
   - The login form expects your bcrypt password hash
   - Password is compared locally using bcryptjs
   - Never sent to a server

3. **Session Created:**
   - A session token is stored in `localStorage`
   - Valid for 24 hours
   - Session automatically validated on page load

4. **Access Settings:**
   - After successful login, redirected to `/settings`
   - Admin features now accessible
   - Click "Sair" (Logout) to end session

### Password Management

#### Setting Password (First Time)

```bash
# Generate bcrypt hash
npx bcryptjs -r 10 "your-secure-password"

# Output:
# $2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Copy to .env.local or deployment environment
ADMIN_PASSWORD_HASH=$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security Notes:**
- Never store plain text passwords
- Always use bcrypt with at least 10 rounds
- Different hash each time (salted)
- Hashes are one-way (irreversible)

#### Changing Password

To change the admin password:

1. Generate new bcrypt hash:
   ```bash
   npx bcryptjs -r 10 "new-password"
   ```

2. Update `ADMIN_PASSWORD_HASH` in:
   - Development: `.env.local`
   - Production: Platform environment variables

3. Users will log in with new password next time

#### Resetting Password

If you forget the password:

1. Generate new bcrypt hash (see steps above)
2. Update `ADMIN_PASSWORD_HASH` in environment
3. Restart the application
4. Log in with new password

---

## API Key Management

### Build-Time Injection

API keys are injected at **build time** by Vite:

```
Development:
.env.local → [Vite Build] → dist/index.html + dist/assets/*.js

Production:
Platform Env Vars → [Vite Build] → dist/ (NO keys in source)
```

### How It Works

1. **In `vite.config.ts`:**
   ```typescript
   define: {
     '__GEMINI_API_KEY__': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
     '__SUPABASE_URL__': JSON.stringify(env.VITE_SUPABASE_URL || ''),
     ...
   }
   ```

2. **In `utils/env.ts`:**
   ```typescript
   export const getEnv = (key: string): string => {
     if (key === 'VITE_GEMINI_API_KEY') {
       return __GEMINI_API_KEY__; // Global constant (safe)
     }
     ...
   }
   ```

3. **In application code:**
   ```typescript
   const apiKey = getEnv('VITE_GEMINI_API_KEY');
   const client = new GoogleGenAI({ apiKey });
   ```

### Security Implications

**Safe:**
- ✅ API keys NOT in source code
- ✅ Keys NOT in git history
- ✅ Keys NOT visible in network requests
- ✅ Build-time injection (immutable in production)

**Known:**
- ℹ️ API keys ARE in `dist/assets/*.js` when built with keys
- ℹ️ This is expected behavior (Vite build-time injection)
- ℹ️ Mitigated by not including `.env` in production deployment

**Never Expose:**
- ❌ Don't commit `.env.local` to git
- ❌ Don't include `.env` in Docker images
- ❌ Don't log API keys
- ❌ Don't share `.env` file

---

## Deployment

### For Vercel / Netlify / Railway

1. **Configure Environment Variables:**
   - Go to project settings
   - Add environment variables:
     - `VITE_GEMINI_API_KEY`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `ADMIN_PASSWORD_HASH`

2. **Build Command:**
   ```bash
   npm run build
   ```

3. **Output Directory:**
   ```
   dist/
   ```

4. **Verify Deployment:**
   - Check that app loads
   - Test login at `/login`
   - Verify Settings page is protected

### For Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# DO NOT COPY .env file into image!
# Instead, environment variables are injected at build time
ARG VITE_GEMINI_API_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG ADMIN_PASSWORD_HASH

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build with:
```bash
docker build \
  --build-arg VITE_GEMINI_API_KEY=sk-proj-... \
  --build-arg VITE_SUPABASE_URL=https://... \
  --build-arg VITE_SUPABASE_ANON_KEY=eyJ... \
  --build-arg ADMIN_PASSWORD_HASH='$2b$10$...' \
  -t desbuquei .
```

### For Server / Self-Hosted

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/desbuquei
   cd desbuquei
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit with your actual values
   nano .env
   ```

3. **Build:**
   ```bash
   npm install
   npm run build
   ```

4. **Deploy `dist/` folder:**
   ```bash
   # Using Nginx
   sudo cp -r dist/* /var/www/html/desbuquei/

   # Using Apache
   sudo cp -r dist/* /var/www/desbuquei/
   ```

5. **Configure web server for HashRouter:**
   ```nginx
   # Nginx: route all requests to index.html for client-side routing
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

---

## Troubleshooting

### "Login page keeps appearing"

**Problem:** Can't access Settings, always redirected to login

**Solutions:**
1. Check `ADMIN_PASSWORD_HASH` is set in environment
2. Verify password hash is correct:
   ```bash
   # Generate new hash
   npx bcryptjs -r 10 "your-password"
   # Update .env.local and restart dev server
   ```
3. Check browser localStorage isn't disabled
4. Clear browser cache and localStorage

### "Session expired unexpectedly"

**Problem:** Logged in but session becomes invalid after page reload

**Solutions:**
1. Check browser localStorage is enabled
2. Verify `auth-token` and `auth-time` in localStorage:
   - Open DevTools > Application > Local Storage
   - Both keys should be present
3. Check system clock isn't too far off
4. Session expires after 24 hours (working as intended)

### "API key not working"

**Problem:** Gemini API errors or no AI definitions loading

**Solutions:**
1. Verify `VITE_GEMINI_API_KEY` is set:
   ```bash
   # Check in development
   echo $VITE_GEMINI_API_KEY
   ```
2. Verify key is valid at https://aistudio.google.com/apikey
3. Check API quota at Google AI Studio dashboard
4. If quota exceeded (429 error), app falls back to local database (expected)
5. Check browser console for detailed error messages

### "Supabase not connecting"

**Problem:** Database features not working, using local DB only

**Solutions:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Test Supabase keys at https://app.supabase.com
3. Check RLS policies are enabled (TD-103)
4. Local database fallback is working (expected if Supabase unavailable)

### "Build includes API keys"

**Problem:** `npm run build` includes exposed API keys in dist/

**Solutions:**
1. This happens when `.env.local` contains keys
2. **For production:** Don't use `.env.local`
   - Use platform environment variables instead
   - Vite will only inject variables present in build environment
3. **For development:** Keep `.env.local` in `.gitignore` (it is)
4. Never commit `.env.local` to git

### Password hash doesn't work

**Problem:** Login fails even with correct password

**Solutions:**
1. Regenerate bcrypt hash:
   ```bash
   npx bcryptjs -r 10 "your-password"
   ```
2. Ensure `ADMIN_PASSWORD_HASH` is copied exactly (including `$2b$10$...`)
3. Try with a simpler password first (no special characters)
4. Check that bcryptjs is installed:
   ```bash
   npm list bcryptjs
   ```

---

## Security Best Practices

### Do's ✅

- ✅ Store `.env.local` locally only (never in git)
- ✅ Use strong, unique admin password
- ✅ Regenerate API keys periodically
- ✅ Rotate passwords when team members leave
- ✅ Use HTTPS in production
- ✅ Monitor API quota usage
- ✅ Review access logs regularly

### Don'ts ❌

- ❌ Don't commit `.env` files to git
- ❌ Don't share API keys via email
- ❌ Don't use weak passwords
- ❌ Don't log sensitive data
- ❌ Don't expose service role key in frontend
- ❌ Don't disable RLS on Supabase tables
- ❌ Don't use plain text passwords

---

## Additional Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Questions?** Check docs/auth/SECURITY-BEST-PRACTICES.md or create an issue on GitHub.
