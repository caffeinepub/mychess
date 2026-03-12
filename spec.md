# MyChess

## Current State
Fresh rebuild. Previous version was a chess platform with communities, notation viewer, pairing page, and floating intro animation.

## Requested Changes (Diff)

### Add
- Floating name animation on startup (must-have)
- Internet Identity authentication
- Communities system (create, browse, post discussions)
- Notation viewer with PGN input (pre-loaded with Opera Game by Morphy, 1858) and photo upload panel
- Pairing page modeled after lichess (time controls grouped by Bullet/Blitz/Rapid/Classical, open challenges table, live games section)
- Math/pairing arena feature

### Modify
- N/A (fresh rebuild)

### Remove
- No "Built with caffeine.ai" footer branding
- No fake/placeholder stats

## Implementation Plan
1. Select authorization component for Internet Identity
2. Generate Motoko backend: communities (CRUD), discussions/posts, notation storage with PGN + photo, pairing/challenges
3. Build frontend:
   - Floating intro animation (chess piece or "MyChess" text)
   - Home page: notable games (clickable, link to notation viewer), no fake stats
   - Communities page: list with loading skeletons, empty states, create community (auth-gated)
   - Notation viewer: PGN editor, move-by-move board, photo upload panel (drag-and-drop, zoom/scroll)
   - Pairing page: lichess-style time control grid, open challenges, live games
   - Auth: Internet Identity sign-in/sign-out, robust error handling (no stuck "SIGNING IN...")
   - Black and white color theme throughout
   - Mobile responsive
