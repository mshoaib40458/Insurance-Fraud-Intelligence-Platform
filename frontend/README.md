# Insurance Fraud Frontend

A professional React.js frontend for the Insurance Fraud & Risk Intelligence Platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **TanStack Query (React Query)** for server state management
- **Recharts** for data visualizations
- **Lucide React** for icons
- **Axios** for HTTP requests

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Table, etc.)
│   └── layout/       # Layout components (Sidebar, Header, PageLayout)
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

This will start the development server at http://localhost:3000 with proxy to backend API.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Features

### Dashboard
- Real-time metrics overview
- Risk distribution visualization
- Top risk claims
- Model information panel

### Claims Management
- Paginated, sortable, filterable claims table
- Advanced search with multiple filters
- Export capabilities

### Claim Detail
- Complete claim feature breakdown
- SHAP explanations with human-readable labels
- Risk and protective factors
- Model metadata

### Search
- Multi-field search interface
- Combined filters
- Results pagination

### Analytics
- Risk distribution pie chart
- Top risk claims bar chart
- Weekly trend lines
- Probability distribution area chart
- Model performance metrics table

### Investigations
- Investigation case tracking
- Status management (Pending, Under Investigation, Cleared, Escalated, Closed)
- Investigator notes
- Modal-based editing
- Summary statistics

## API Integration

The frontend connects to the FastAPI backend via the `/api` proxy configured in `vite.config.ts`. All API types are defined in `src/types/api.ts` and match the backend Pydantic schemas.

## Configuration

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)