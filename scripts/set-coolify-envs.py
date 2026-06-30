#!/usr/bin/env python3
"""Set env vars for generaia-app in Coolify."""
import subprocess, json

with open("/root/.hermes/state/coolify-api-key.txt") as f:
    token = f.read().strip()

BASE = "http://127.0.0.1:8000/api/v1"
UUID = "yxvg08txlg20u6kk1g4dql9a"

envs = [
    ("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_cHJldHR5LWphdmVsaW4tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA"),
    ("CLERK_SECRET_KEY", "sk_test_d4Hz4XYMLMugPJH9Dv1R0Ezh8CKdVhtTULmkR498tg"),
    ("NEXT_PUBLIC_APP_URL", "https://app.generaia.org"),
]

for key, val in envs:
    data = json.dumps({"key": key, "value": val, "is_literal": True, "is_preview": False})
    cmd = [
        "curl", "-s", "-X", "POST", f"{BASE}/applications/{UUID}/envs",
        "-H", f"Authorization: Bearer {token}",
        "-H", "Content-Type: application/json",
        "-d", data
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    print(f"{key}: {r.stdout.strip()[:120]}")

print("\n✅ Env vars set")
