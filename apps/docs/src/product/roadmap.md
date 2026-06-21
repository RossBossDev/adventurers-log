# Product roadmap

This roadmap describes the planned product direction for Adventurers' Log. It is intentionally milestone-based rather than date-based because the app is still early-stage.

## 1. Product foundation docs

Make the product direction explicit before feature work starts.

Planned outcomes:

- product vision documented
- MVP direction documented
- brand direction documented
- public docs site organized around the early product story

## 2. Deployment baseline

Prove the scaffold can ship before building deeper features.

Planned outcomes:

- backend deployed
- web frontend deployed
- docs deployed
- production environment variables documented
- migration and release process documented

## 3. TestFlight baseline

Derisk iOS signing and release flow early.

Planned outcomes:

- scaffold iOS app deployable to TestFlight
- repeatable build and upload workflow
- Apple capabilities planned for future Sign in with Apple and push notifications

## 4. Auth baseline

Add app identity for social features.

Planned outcomes:

- Sign in with Apple
- Sign in with Google
- email OTP
- authenticated backend user identity
- anonymous player lookup still possible where appropriate

## 5. Player tracking ingestion foundation

Track OSRS usernames once globally and store snapshots for app logic.

Planned outcomes:

- canonical tracked player model by normalized OSRS username
- one sync path per tracked player rather than per follower
- raw external payload storage for debugging and schema discovery
- normalized snapshots for app logic
- initial WikiSync provider work
- Wise Old Man access and reliability spike

## 6. Snapshot diff and event engine

Turn player-data changes into deterministic app events.

Planned outcomes:

- skill and total-level diffing
- idempotent event generation
- tests for no-change, level-up, and multi-level cases

## 7. Goals MVP

Let authenticated users declare goals against tracked players.

Planned outcomes:

- skill-level goals
- total-level goals
- grouped skill goals such as base 80s
- goal visibility controls
- completion reveal behavior
- goal completion evaluation

## 8. Friendships and social feed

Prove the core social loop.

Planned outcomes:

- friend request and approval flow
- feed of eligible friend progress events
- privacy-aware event projection
- minimal web and iOS surfaces for viewing the loop

## 9. Notifications foundation

Prepare for meaningful milestone alerts.

Planned outcomes:

- push token registration
- notification preferences
- event-to-notification pipeline
- first controlled notification type: friend goal completed

## 10. Collection-log and advanced source spikes

Decide which richer OSRS activity events are feasible after the MVP basics are proven.

Planned outcomes:

- collection-log item data-source spike
- boss, activity, clue, and quest-data limitations documented
- roadmap updates based on real data availability

## Roadmap principles

- Ship the deployment and release path early.
- Keep the first product loop narrow: player progress, declared goals, friends, feed.
- Treat external APIs as ingestion sources, not the product's source of truth.
- Avoid overpromising advanced game-data features until data availability is proven.
