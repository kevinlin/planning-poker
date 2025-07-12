# Planning Poker - Zühlke Story Estimation Tool

A real-time story estimation tool for agile teams using poker-style voting with Fibonacci scale.

## Features

- **Session Management**: Create sessions with JIRA key and story title
- **Real-time Voting**: Fibonacci scale voting (1, 2, 3, 5, 8, 13, 21)
- **Participant Management**: Track active participants with 30-second timeout
- **Voting Rules**: 
  - 1 estimate = final result
  - 2 estimates = majority wins
  - 3+ estimates = discussion needed
- **Session Expiration**: Sessions expire after 15 minutes of inactivity
- **Persistent Storage**: File-based storage that survives server restarts
- **Zühlke Branding**: Professional UI with Zühlke gradient colors

## Deployment

### Vercel (Recommended)

Vercel is the recommended deployment platform for this full-stack Next.js application.

#### Quick Deploy to Vercel

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Vercel will automatically detect it's a Next.js app

3. **Configure Environment Variables** (optional):
   - `DATA_DIR`: Custom data directory path (defaults to `/tmp/data` on Vercel)

4. **Deploy**: Vercel will automatically build and deploy your app

#### Manual Vercel Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

**Note**: On Vercel, session data is stored in `/tmp` directory and will be ephemeral (resets on function cold starts). For persistent storage, consider integrating with a database like Vercel KV or PostgreSQL.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Other Deployment Options

#### Render
1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables as needed

#### DigitalOcean App Platform
1. Create a new app from your GitHub repository
2. DigitalOcean will auto-detect the Next.js configuration
3. Configure environment variables in the app settings
4. Deploy

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Enable Next.js runtime for API routes
5. Configure environment variables as needed

## Architecture

### Backend Storage

The application uses a file-based persistent storage system that:
- Stores sessions in JSON format
- Automatically cleans up expired sessions every 5 minutes
- Supports custom data directory via `DATA_DIR` environment variable
- Includes automatic date serialization/deserialization
- Provides health check endpoint at `/api/health`

### Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Hook Form** - Form handling

## Usage

1. **Create a Session**: Enter JIRA key and story title
2. **Share Session Code**: Participants join using the 4-character code
3. **Vote**: Each participant selects their estimate
4. **Reveal**: Votes are automatically revealed when all participants vote
5. **Finalize**: Choose the final estimate for the story

## Session Management

- Sessions are automatically cleaned up after 15 minutes of inactivity
- Participants are marked inactive after 30 seconds
- Session codes are unique 4-character alphanumeric strings
- All data is stored locally in the browser (static version)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

Built for Zühlke Engineering teams. 