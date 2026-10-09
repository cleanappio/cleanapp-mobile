#!/usr/bin/env python3
"""Build a Play bundle using a private, untracked signing configuration."""
import argparse
import json
import os
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--signing-file", required=True, type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
signing_file = args.signing_file.resolve()
if signing_file.stat().st_mode & 0o077:
    parser.error("Signing configuration must be readable only by its owner (chmod 600).")
config = json.loads(signing_file.read_text())
fields = {
    "storeFile": "CLEANAPP_UPLOAD_STORE_FILE",
    "storePassword": "CLEANAPP_UPLOAD_STORE_PASSWORD",
    "keyAlias": "CLEANAPP_UPLOAD_KEY_ALIAS",
    "keyPassword": "CLEANAPP_UPLOAD_KEY_PASSWORD",
}
if any(not isinstance(config.get(key), str) or not config[key] for key in fields):
    parser.error("Signing configuration is missing a required field.")
store = Path(config["storeFile"]).expanduser()
if not store.is_absolute():
    store = signing_file.parent / store
store = store.resolve(strict=True)
if store.stat().st_mode & 0o077:
    parser.error("Upload keystore must be readable only by its owner (chmod 600).")
config["storeFile"] = str(store)
env = os.environ.copy()
for key, property_name in fields.items():
    env["ORG_GRADLE_PROJECT_" + property_name] = config[key]
subprocess.run(["./gradlew", ":app:bundleRelease"], cwd=root / "android", env=env, check=True)
print("Bundle: " + str(root / "android/app/build/outputs/bundle/release/app-release.aab"))
print("Google Play must recognize this upload certificate before submission.")
