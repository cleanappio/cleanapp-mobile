# Mandatory Agent Rules

These rules apply to **all automated agents** working in this repo:

## 1) No Secrets in Git
Never commit or stage any secret material. Examples:
- `.p12`, `.p8`, `.mobileprovision`, `.cer`, `.csr`, `.key`, `.pem`
- `.env`, `.env.*` or any file containing tokens/keys
- API tokens or service credentials in source or config

If you find secrets in the working tree, leave them untracked and notify the user.

## 2) Always Respect .gitignore
Before staging changes, verify no secret files are included.

## 3) Use Secret Scanning
If you touch release, build, or deployment code:
- Run or ensure CI runs the gitleaks check.
- Do not bypass failures.

## 4) If You Suspect a Leak
Stop and notify the user immediately. Do not push or open PRs until resolved.
