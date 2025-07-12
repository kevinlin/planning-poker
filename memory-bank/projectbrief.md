# Project Brief: Planning Poker - Zühlke Story Estimation Tool

## Overview
A lightweight, real-time web application for agile story estimation using poker-style voting. The application enables teams to estimate JIRA stories using the Fibonacci scale through collaborative voting sessions. Each session is tied to a single JIRA story and is shareable via a unique short code (e.g., "AB12"). Primarily designed for Zühlke teams but accessible to anyone with the link.

## Core Requirements
- **Session Creation**: Create sessions with JIRA key and story title, auto-generate unique short codes
- **Real-time Voting**: Fibonacci scale voting (1, 2, 3, 5, 8, 13, 21) with poker card interface
- **Participant Management**: Track active participants with 30-second activity timeout
- **Voting Rules**: 
  - 1 estimate = final result
  - 2 estimates = majority wins  
  - 3+ estimates = discussion needed, then revote
- **Session Lifecycle**: 15-minute expiration, persistent storage that survives server restarts
- **Zühlke Branding**: Professional UI with Zühlke gradient colors and branding

## Goals
- **Streamline Estimation**: Reduce time spent on story estimation in agile ceremonies
- **Remote Collaboration**: Enable distributed teams to estimate stories effectively
- **Consensus Building**: Implement clear voting rules that promote discussion and agreement
- **User Experience**: Provide intuitive, responsive interface that works across devices
- **Reliability**: Ensure sessions persist through server restarts and network interruptions

## Project Scope

### In Scope
- Single-story estimation sessions
- Real-time voting with automatic reveal
- Participant activity tracking and management
- File-based persistent storage
- Responsive web interface
- Session expiration and cleanup
- Zühlke branding and styling
- Deployment on cloud platforms (Vercel, Render, etc.)

### Out of Scope (Future Enhancements)
- Multiple story queue per session
- Figma plugin integration
- Dark mode
- Session export (CSV/JSON)
- Admin dashboard for metrics
- User authentication/accounts
- Advanced analytics or reporting 