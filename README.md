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
- **Zühlke Branding**: Professional UI with Zühlke gradient colors

## Deployment

### GitHub Pages (Static)

This project is configured to deploy to GitHub Pages as a static site. The static version uses localStorage for session management.

**Live Demo**: [https://kevinlin.github.io/planning-poker](https://kevinlin.github.io/planning-poker)

#### Setup GitHub Pages Deployment

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - Save the configuration

2. **Push to main/master branch** - the GitHub Action will automatically:
   - Build the Next.js app with static export
   - Deploy to GitHub Pages
   - Make it available at `https://[username].github.io/planning-poker`

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

## Architecture

### Static vs Dynamic Deployment

The application supports two deployment modes:

1. **Static (GitHub Pages)**: Uses localStorage for session management
2. **Dynamic (Server)**: Uses file-based persistent storage with API routes

The deployment mode is automatically detected based on environment variables.

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