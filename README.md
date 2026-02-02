# desbuguei

> Technical glossary with AI-powered term definitions

Interactive glossary application with AI-powered definitions of technology terms in Portuguese, featuring business-focused explanations, examples, analogies, and practical usage contexts.

## Features

- 🤖 AI-powered term generation using Google Gemini
- 🎤 Voice assistance with Web Speech API
- 📚 Interactive glossary with search and filtering
- ❤️ Save favorite terms
- 📜 Search history
- 🎨 Light/Dark theme support
- 💾 Supabase integration for data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API Key (from Google AI Studio)
- Supabase account (optional, for production)

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

## Documentation

- [Architecture](docs/architecture/README.md)
- [Contributing](CONTRIBUTING.md)

---

Created with [Synkra AIOS](https://github.com/synkra/aios-core) 🚀
