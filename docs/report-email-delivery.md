# Report email delivery

My Reports keeps an email delivery summary on each owned report. **View escalation log** opens the report's email receipts, with each contact and their recorded email time. Delivery banners and system notifications open this same section. Reopening a focused report refreshes its status and scrolls to the log.

The app fetches the current owner's `read_report_email_status` on focus, refresh, and return to the app. Reads are limited to three concurrent requests; queued reads stop when the screen loses focus. Successful recipient receipts supply unique contact counts and email times. The report's `last_email_sent_at` processing marker does not establish a send. Pending, retry, no-delivery, and unavailable states have distinct messages. Times use the device's locale and time zone.

The backend retains the latest receipt per report/contact, so the log is a durable contact summary rather than a complete history of retry attempts. No separate notification inbox or local recipient archive is added. Older pushes remain compatible with `navigate_to=my_report_details`; new pushes also include `initial_section=escalation_log` and `recipient_count`.

## Validation and release baseline

The feature is based on `codex/sort-game` commit `74576f4` (version 3.2.29). This preserves the committed Sort features, and its notification files match the current local 3.2.29/build 51 release checkout. The local build 51 archive does not record a Git SHA, and the original checkout contains uncommitted Sort and native release fixes. A full release must preserve or reconcile those original changes. `main` still contains version 3.2.28; using that older baseline would omit the committed 3.2.29 features. This feature does not modify versioning or store release automation.

Focused Jest tests cover receipt counts/times, persistent report summaries, toast actions, cold and repeated push opens, late request races, owner changes, request limits, and scrolling after asynchronous content loads. Run `npm test -- --runInBand`, `npm run lint`, and `npx tsc --noEmit`. Local verification passed all 32 Jest tests, full ESLint, TypeScript, and Metro production bundles for both platforms. The full current-tree Gitleaks scan also passed after removing the obsolete bundle. A physical-device check remains necessary for native notification taps and scroll behavior; JavaScript tests do not validate APNS/FCM delivery or store publication.


## Generated artifacts and secret scanning

The obsolete tracked `android/app/src/main/assets/index.android.bundle` was removed and its exact generated path is ignored. The React Native Gradle plugin creates and packages a fresh JavaScript bundle for non-debug variants from the current entry file; `npm run android:bundle` and the existing Android build script also regenerate the manual bundle. Debug development builds normally use Metro. This prevents an old committed bundle from retaining earlier code or configuration.

That old artifact contained a historical Google Maps Geocoding API key. Removing the artifact cleans the current tree; it does not remove Git history or prove that the key is restricted or rotated. The Google key metadata read returned 403, so restrictions still require owner review. No rotation is claimed. Three other scanner findings in the same removed bundle were minified library expressions, not credentials.

The Secret Scan workflow uses pinned standalone Gitleaks 8.30.0 to scan the full current tree without the paid action license. No credential allowlist or scan exclusion is added. Historical credential review remains a separate follow-up.
