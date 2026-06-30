#!/usr/bin/env python3
"""Create Clerk CNAME records via Cloudflare Global API Key."""
import subprocess, json

with open("/tmp/cf-token.txt") as f:
    api_key = f.read().strip()

EMAIL = "gobeadicto@gmail.com"
BASE = "https://api.cloudflare.com/client/v4"

def cf(method, path, data=None):
    cmd = ["curl", "-s", "-X", method, BASE + path,
           "-H", "X-Auth-Email: " + EMAIL,
           "-H", "X-Auth-Key: " + api_key]
    if data:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    return json.loads(r.stdout)

# 1. Get zone ID
r = cf("GET", "/zones?name=generaia.org")
if not r.get("success"):
    print("ERROR:", json.dumps(r.get("errors"), indent=2))
    exit(1)

zone_id = r["result"][0]["id"]
print("Zone ID:", zone_id)
print("Zone:", r["result"][0]["name"])

# 2. Create CNAME records
records = [
    ("clerk", "frontend-api.clerk.services"),
    ("accounts", "accounts.clerk.services"),
]

for name, target in records:
    r = cf("GET", "/zones/" + zone_id + "/dns_records?type=CNAME&name=" + name + ".generaia.org")
    existing = r.get("result", [])

    if existing:
        rec_id = existing[0]["id"]
        r = cf("PATCH", "/zones/" + zone_id + "/dns_records/" + rec_id, {
            "type": "CNAME", "name": name, "content": target,
            "proxied": False, "ttl": 1
        })
        status = "Updated" if r.get("success") else "FAILED"
        print(status + ": " + name + ".generaia.org -> " + target)
    else:
        r = cf("POST", "/zones/" + zone_id + "/dns_records", {
            "type": "CNAME", "name": name, "content": target,
            "proxied": False, "ttl": 1
        })
        status = "Created" if r.get("success") else "FAILED"
        print(status + ": " + name + ".generaia.org -> " + target)
        if not r.get("success"):
            print("  Error:", json.dumps(r.get("errors")))

print("\nDone.")
