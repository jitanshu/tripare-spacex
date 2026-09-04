# Performance

## Targets

- Cached initial load to interactive: target under 3 seconds.
- Launch list scroll: target sustained 60fps for 1000+ rows.
- Normal memory: target under 150 MB.
- Bundle size: iOS export measured at 3.4 MB on disk; Hermes bundle reported as 3.5 MB.

## Implementation Notes

FlashList renders a flattened section model with stable row heights and sticky month headers. Filtering and sorting are pure functions over cached normalized data, so typing in search and toggling chips avoids refetching. React Query deduplicates reads and SQLite keeps first paint available after any successful sync.

Images use `expo-image` disk caching. The intended image cache budget is 64 MB, documented in `.env.example`; a production pass should add platform-specific cache telemetry and eviction metrics.

## Reproduction

1. Run `npm install`.
2. Run `cp .env.example .env`.
3. Run `npm run ios` or `npm run android`.
4. Complete one successful sync, switch network off, and relaunch.
5. Profile the Launches tab while scrolling the full list and while applying filters.

## Current Headless Results

- `npm test`: 4 suites, 6 tests passing.
- `npm run typecheck`: passes.
- `expo prebuild --no-install`: generated `ios/` and `android/` successfully.
- `npx expo export --platform ios`: generated `dist/`; Expo reported `_expo/static/js/ios/*.hbc` at 3.5 MB and `du -sh dist` measured 3.4 MB.
- Native runtime profiler screenshots and memory/FPS recordings still need to be captured on a simulator/device because this environment is headless.

## Bundle Notes

Expected bundle drivers are React Native/Expo, React Navigation, React Query, FlashList, react-native-maps, Expo SQLite, and Zod. To reproduce the measured production bundle analysis, run:

```bash
npx expo export --platform ios
du -sh dist
```

Npm currently reports moderate dependency advisories in the generated Expo/RN dependency tree. They should be reviewed before shipping to an app store, but they do not affect the local unit test pass.
