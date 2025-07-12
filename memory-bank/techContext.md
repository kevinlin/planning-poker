# Tech Context: Planning Poker - Zühlke Story Estimation Tool

## Technologies Used

### Frontend Stack
- **Next.js 15**: React framework with App Router for full-stack capabilities
- **React 19**: UI library with hooks for state management
- **TypeScript 5**: Type safety and better developer experience
- **Tailwind CSS 3.4**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for UI elements
- **Lucide React**: Icon library for consistent iconography

### Backend Stack
- **Next.js API Routes**: Server-side API endpoints
- **Node.js**: Runtime environment
- **File System (fs)**: Built-in module for persistent storage
- **JSON**: Data serialization format for session storage

### Development Tools
- **Stagewise Toolbar**: Development debugging and inspection
- **ESLint**: Code linting and style enforcement
- **PostCSS**: CSS processing and optimization
- **Turbopack**: Fast bundler for development

### Key Dependencies
```json
{
  "next": "15.2.4",
  "react": "^19",
  "typescript": "^5",
  "tailwindcss": "^3.4.17",
  "@radix-ui/react-*": "Various versions",
  "lucide-react": "^0.454.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.5"
}
```

## Development Setup

### Prerequisites
- Node.js 18+ (recommended: latest LTS)
- npm or yarn package manager
- Git for version control

### Local Development
```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables
```bash
# Optional: Custom data directory path
DATA_DIR=/path/to/data

# Development vs Production
NODE_ENV=development|production

# Platform-specific (Vercel)
VERCEL=1  # Automatically set on Vercel
```

## Technical Constraints

### Storage Limitations
- **File-based storage**: Limited to server file system, not suitable for serverless at scale
- **Vercel limitation**: `/tmp` directory is ephemeral, data resets on function cold starts
- **Concurrent access**: No locking mechanism for simultaneous file writes
- **Backup**: Manual backup required, no automated backup strategy

### Performance Constraints
- **Polling frequency**: 2-second intervals balance real-time feel with server load
- **Session cleanup**: 5-minute intervals prevent memory bloat but may delay cleanup
- **File I/O**: Debounced writes (1-second delay) prevent excessive disk operations
- **Memory usage**: All sessions kept in memory, limited by server RAM

### Platform Constraints
- **Serverless compatibility**: Works on Vercel but with ephemeral storage
- **WebSocket limitations**: No real-time WebSocket support, relies on polling
- **File system access**: Requires platforms that support persistent file storage

## Dependencies

### Core Dependencies
- **@radix-ui/react-***: Accessible UI components (Button, Card, Input, etc.)
- **lucide-react**: Icon library for UI elements
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class names
- **tailwind-merge**: Tailwind class merging utility

### Development Dependencies
- **@stagewise/toolbar-next**: Development debugging tools
- **@types/node**: TypeScript definitions for Node.js
- **@types/react**: TypeScript definitions for React
- **postcss**: CSS processing
- **tailwindcss**: CSS framework

## Tool Usage Patterns

### Code Organization
```
app/                    # Next.js App Router
├── api/               # API routes
│   └── sessions/      # Session management endpoints
├── session/[code]/    # Dynamic session pages
├── globals.css        # Global styles
├── layout.tsx         # Root layout
└── page.tsx           # Home page

components/            # Reusable UI components
├── ui/               # Base UI components
├── poker-card.tsx    # Poker card components
└── participant-list.tsx

lib/                  # Utility libraries
├── sessions.ts       # Session management logic
├── storage.ts        # File-based storage
├── types.ts          # TypeScript interfaces
└── utils.ts          # Utility functions
```

### Styling Patterns
```css
/* Custom Zühlke color variables */
:root {
  --primary-color: #985b9c;
  --gradient-start: #aa41af;
  --gradient-middle: #3c69c8;
  --gradient-end: #00a5e6;
}

/* Utility classes */
.zuhlke-gradient {
  background-image: linear-gradient(45deg, var(--gradient-start) 5%, var(--gradient-middle) 60%, var(--gradient-end) 100%);
}
```

### API Patterns
```typescript
// Consistent error handling
try {
  const result = await operation();
  return NextResponse.json(result);
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

### Component Patterns
```typescript
// Consistent prop interfaces
interface ComponentProps {
  required: string;
  optional?: boolean;
  callback?: () => void;
  className?: string;
}

// Conditional styling with clsx
className={cn(
  "base-classes",
  {
    "conditional-class": condition,
    "another-class": anotherCondition,
  },
  className
)}
``` 