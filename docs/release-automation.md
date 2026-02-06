# Mobile Release Automation

This repo is set up to auto-publish mobile releases on every merge to `main` via GitHub Actions.

## What was added

- Fastlane lanes for iOS + Android: `fastlane/Fastfile`
- Fastlane app config: `fastlane/Appfile`
- CI workflow: `.github/workflows/release-mobile.yml`

## Required GitHub Secrets

### iOS (App Store Connect)

- `IOS_TEAM_ID`
- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_KEY_BASE64` (base64-encoded `.p8` content)

Optional (if you use `match` for signing):

- `MATCH_GIT_URL`
- `MATCH_PASSWORD`
- `MATCH_GIT_BASIC_AUTHORIZATION`

### Android (Google Play)

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (raw JSON string)
- `ANDROID_KEYSTORE_BASE64` (base64-encoded keystore file)
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

## One-time external setup

1. App Store Connect API key with app access for `io.cleanapp`.
2. Google Play service account with release access for `com.cleanapp`.
3. Android upload keystore created/exported and saved in secrets.
4. iOS signing/certs available in CI (recommended via `match`).

## How release runs

- Trigger: push to `main` (or manual run from Actions tab).
- Android lane: builds `app-release.aab` and uploads to Play track (`production` by default).
- iOS lane: increments build number and uploads to App Store Connect (does not auto-submit for review).
