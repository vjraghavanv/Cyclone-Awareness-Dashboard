# Cyclone Awareness Dashboard

Real-time cyclone risk information dashboard for Chennai and surrounding districts.

## Features

- Cyclone pathway visualization with affected districts
- District-wise rainfall predictions and flooding risk
- Holiday likelihood predictions for schools/colleges
- Travel route safety checker
- Consolidated cyclone updates feed
- Preparation checklist
- Bilingual support (English/Tamil)
- Accessibility compliant (WCAG 2.1 Level AA)

## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- Leaflet.js for maps
- Vitest + fast-check for testing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run property-based tests
npm run test:properties

# Build for production
npm run build:prod

# Preview production build
npm run preview

# Run pre-deployment checks
npm run pre-deploy
```

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide to get up and running
- **[BUILD.md](./BUILD.md)** - Build configuration and optimization guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions for various platforms
- **[OPTIMIZATION.md](./OPTIMIZATION.md)** - Performance optimization strategies
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Accessibility features and guidelines

## Project Structure

```
src/
├── components/       # React components
├── contexts/         # React contexts
├── services/         # Business logic services
│   ├── api/         # API client
│   ├── cache/       # Caching system
│   ├── storage/     # Local storage management
│   └── severity/    # Severity calculation
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
└── styles/          # Global styles

tests/
├── unit/            # Unit tests
└── properties/      # Property-based tests
```

## License

ISC
