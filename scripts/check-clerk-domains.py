#!/usr/bin/env python3
"""Check Clerk domains and DNS requirements."""
import subprocess, json

# Read secret key from .env.local
sk = None
with open("/root/generaia-app/.env.local") as f:
    for line in f:
        if line.startswith("CLERK_SECRET_KEY="):
            sk = line.split("=", 1)[1].strip()
            break

if not sk:
    print("ERROR: CLERK_SECRET_KEY not found in .env.local")
    exit(1)

print("Using key:", sk[:10] + "...")
r = subprocess.run(
    ["curl", "-s", "https://api.clerk.com/v1/domains",
     "-H", "Authorization: Bearer " + sk],
    capture_output=True, text=True, timeout=15
)

d = json.loads(r.stdout)
if isinstance(d, list):
    for dom in d:
        print("---")
        print("Domain:", dom.get("name"))
        print("Status:", dom.get("status"))
        print("Frontend API URL:", dom.get("frontend_api_url"))
        dns = dom.get("dns", {})
        if isinstance(dns, dict):
            for key, val in dns.items():
                print("  DNS:", key, "->", val)
        elif isinstance(dns, list):
            for rec in dns:
                print("  DNS record:", rec)
        print()
elif isinstance(d, dict) and "errors" in d:
    print("Error:", json.dumps(d["errors"], indent=2))
else:
    print(json.dumps(d, indent=2)[:2000])
