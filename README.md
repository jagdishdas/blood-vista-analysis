# BloodVista - CBC Blood Test Analyzer

A professional CBC (Complete Blood Count) blood report analyzer with English and Urdu language support.

## Features

- 📊 Comprehensive CBC blood test analysis
- 🌐 Bilingual support (English/Urdu)
- 🔐 User authentication with email/password and Google OAuth
- 📄 PDF report upload and parsing
- 📈 Visual health insights and recommendations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Authentication, Database)
- **Deployment**: Vercel/Netlify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/bloodvista.git
cd bloodvista
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the template:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:8080](http://localhost:8080)

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Vercel or Netlify with your own Supabase backend.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

## License

MIT
