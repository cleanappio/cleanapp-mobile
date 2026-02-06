# Security & Secrets Policy (Mandatory)

This repo must **never** contain secrets or private keys. This includes, but is not limited to:

- Apple/Google certs & provisioning profiles (`*.p12`, `*.mobileprovision`, `*.cer`, `*.csr`, `*.p8`)
- API keys, tokens, OAuth secrets, or private keys of any kind
- `.env` files or any environment files containing secrets
- Service account files or credentials (Firebase, GCP, AWS, etc.)

## Required Rules

1. **Do not commit secrets** — ever. If a secret appears in git history, rotate it immediately.
2. **Never upload keys** to GitHub. Use CI secrets or encrypted storage.
3. **Always scan** before commit or PR (see secret scanning below).

## Secret Scanning (Required)

This repo uses gitleaks to prevent accidental secret leaks. You must:

- Run secret scan locally before committing if you are making release/infra changes.
- Ensure CI passes the gitleaks check on every PR.

If you see a gitleaks failure, **do not bypass it** — fix it or rotate the secret.

## If a Secret Leaks

1. **Revoke/rotate** the key immediately.
2. Remove it from the repo (rewrite history if required).
3. Re-run secret scan and verify clean.

This policy is mandatory for all human and automated agents.
