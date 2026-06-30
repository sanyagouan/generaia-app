#!/usr/bin/env python3
import subprocess, json, os

TF = "/root/.hermes/state/cloudflare-api-token.txt"
if os.path.exists(TF):
    with open(TF) as f:
        token = f.read().strip()
elif os.environ.get("CF_API_TOKEN"):
    token = os.environ["CF_API_TOKEN"]
else:
    print("Need Cloudflare API token")
    exit(1)

# Get zone ID
r = subprocess.run(["curl", "-s", "https://api.cloudflare.com/client/v4/zones?name=generaia.org",
    "-H", f"Authorization: Bearer {token}"], capture_output=True, text=True, timeout=15)
d = json.loads(r.stdout)
if not d.get("success"):
    print(f"Error getting zones: {d.get('errors')}")
    exit(1)

zone_id = d["result"][0]["id"]
print(f"Zone ID: {zone_id}")
print(f"Zone: {d['result'][0]['name']}")

# Check if record exists
r = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?type=A&name=app.generaia.org",
    "-H", f"Authorization: Bearer {token}"], capture_output=True, text=True, timeout=15)
existing = json.loads(r.stdout)
if existing.get("result") and len(existing["result"]) > 0:
    record = existing["result"][0]
    print(f"Record exists: {record['name']} -> {record['content']}")
    if record["content"] != "207.180.200.31":
        # Update it
        data = json.dumps({"type": "A", "name": "app", "content": "207.180.200.31", "ttl": 120, "proxied": True})
        r = subprocess.run(["curl", "-s", "-X", "PUT",
            f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record['id']}",
            "-H", f"Authorization: Bearer {token}",
            "-H", "Content-Type: application/json", "-d", data], capture_output=True, text=True, timeout=15)
        result = json.loads(r.stdout)
        if result.get("success"):
            print("Updated DNS record to 207.180.200.31")
        else:
            print(f"Error updating: {result.get('errors')}")
    else:
        print("Already pointing to correct IP")
else:
    # Create it
    data = json.dumps({"type": "A", "name": "app", "content": "207.180.200.31", "ttl": 120, "proxied": True})
    r = subprocess.run(["curl", "-s", "-X", "POST",
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
        "-H", f"Authorization: Bearer {token}",
        "-H", "Content-Type: application/json", "-d", data], capture_output=True, text=True, timeout=15)
    result = json.loads(r.stdout)
    if result.get("success"):
        print("Created DNS record: app.generaia.org -> 207.180.200.31")
    else:
        print(f"Error creating: {result.get('errors')}")

print("\nDone.")
