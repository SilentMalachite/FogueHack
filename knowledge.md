# FogueHack - NetHack-style ASCII Roguelike RPG

## Project Overview

FogueHack is a browser-based roguelike RPG inspired by NetHack, featuring ASCII graphics and full Japanese language support. Built with React + TypeScript frontend and Express.js backend.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand (state management), Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: Drizzle ORM (optional)
- **Audio**: Web Audio API with MP3 support
- **Testing**: Custom test console at `/test-console.html`

## Development Commands

- `npm run dev` - Start development server (full-stack)
- `npm run build` - Build for production
- `npm run check` - TypeScript type checking
- `npm run lint` - ESLint
- `npm run format` - Prettier formatting

## Game Systems

- **Magic System**: Heal, Fireball, Teleport spells with MP management
- **Quest System**: 8 quest types (defeat, collect, explore, craft, deliver)
- **Crafting System**: Recipe-based item creation with skill levels
- **Audio System**: BGM + sound effects with volume controls
- **Save System**: LocalStorage-based game persistence

## Key Features

- Procedural dungeon generation
- Turn-based combat
- ASCII aesthetics
- Keyboard controls (WASD/arrows + special keys)
- Real-time progress tracking

## File Structure

- `client/` - React frontend
- `server/` - Express backend
- `shared/` - TypeScript type definitions
- `client/src/lib/` - Core game logic
- `client/src/components/` - React components

## Development Notes

- Uses Vite multi-page setup (main app + test console)
- Global game state exposed for testing (`window.useGameState`)
- Supports development on Windows/macOS/Linux
- Audio files in `client/public/sounds/`
- Comprehensive documentation in `docs/` directory
- Server host binding uses localhost (not 0.0.0.0) to avoid ENOTSUP errors

## Documentation Structure

- `docs/API.md` - Backend API specification
- `docs/ARCHITECTURE.md` - System design and data flow
- `docs/GAME_SYSTEMS.md` - Detailed game mechanics documentation
- `docs/DEVELOPER_GUIDE.md` - Complete developer onboarding guide
- `docs/DEPLOYMENT.md` - Production deployment instructions
- `docs/README.md` - Documentation index and navigation

## Recent Fixes

- Item placement mapping unified (positionKey->itemId)
- Spell system integration through castSpell() for quest progression
- Quest monster names normalized (orc/dragon vs Japanese names)
- Crafting recipe alignment (iron_sword vs steel_sword)
- Server binding issue resolved (localhost vs 0.0.0.0)
