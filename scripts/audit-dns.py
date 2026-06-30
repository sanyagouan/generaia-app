#!/usr/bin/env python3
"""Audit all Cloudflare DNS records for generaia.org."""
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

# Get zone ID
r = cf("GET", "/zones?name=generaia.org")
zone_id = r["result"][0]["id"]

# Get ALL DNS records
all_records = []
page = 1
while True:
    r = cf("GET", "/zones/" + zone_id + "/dns_records?per_page=100&page=" + str(page))
    records = r.get("result", [])
    all_records.extend(records)
    total_pages = r.get("result_info", {}).get("total_pages", 1)
    if page >= total_pages:
        break
    page += 1

# Print summary
print("=" * 90)
print("DNS RECORDS FOR generaia.org (" + str(len(all_records)) + " records)")
print("=" * 90)
print(f"{'TYPE':<8} {'NAME':<45} {'CONTENT':<45} {'PROXY':<6} {'TTL'}")
print("-" * 90)

for rec in sorted(all_records, key=lambda x: (x["type"], x["name"])):
    proxy = "🟠" if rec.get("proxied") else "⚪"
    ttl = "Auto" if rec.get("ttl") == 1 else str(rec.get("ttl", "?"))
    name = rec["name"]
    content = rec["content"]
    if len(content) > 43:
        content = content[:40] + "..."
    print(f"{rec['type']:<8} {name:<45} {content:<45} {proxy:<6} {ttl}")

# Analysis
print("\n" + "=" * 90)
print("ANALYSIS")
print("=" * 90)

issues = []
a_records = [r for r in all_records if r["type"] == "A"]
cname_records = [r for r in all_records if r["type"] == "CNAME"]
proxied = [r for r in all_records if r.get("proxied")]
dns_only = [r for r in all_records if not r.get("proxied") and r["type"] in ("A", "CNAME", "AAAA")]

# Check for wildcard
wildcards = [r for r in all_records if r["name"].startswith("*.")]
print(f"Wildcard records: {len(wildcards)}")
for w in wildcards:
    print(f"  {w['name']} -> {w['content']} ({'proxied' if w.get('proxied') else 'DNS only'})")

# Check Clerk records
clerk_records = [r for r in all_records if "clerk" in r["name"] or "accounts" in r["name"]]
print(f"\nClerk records: {len(clerk_records)}")
for c in clerk_records:
    proxy = "proxied" if c.get("proxied") else "DNS only"
    print(f"  {c['name']} -> {c['content']} ({proxy})")

# Check for duplicates
seen = {}
dups = []
for r in all_records:
    key = (r["type"], r["name"])
    if key in seen:
        dups.append(r)
    seen[key] = True
if dups:
    print(f"\n⚠️  Duplicate records: {len(dups)}")
    for d in dups:
        print(f"  {d['type']} {d['name']} -> {d['content']}")
else:
    print("\n✅ No duplicate records")

# Check proxied vs DNS only
print(f"\nProxied (orange): {len(proxied)}")
print(f"DNS only (grey): {len(dns_only)}")

# Check for records pointing to wrong IP
vps_ip = "207.180.200.31"
for r in a_records:
    if r["content"] != vps_ip and "clerk" not in r["name"]:
        issues.append(f"⚠️  A record {r['name']} -> {r['content']} (NOT VPS IP)")

# Check Clerk DNS only
for r in clerk_records:
    if r.get("proxied"):
        issues.append(f"⚠️  Clerk record {r['name']} is PROXIED (should be DNS only)")

if issues:
    print("\n⚠️  ISSUES FOUND:")
    for i in issues:
        print(f"  {i}")
else:
    print("\n✅ No issues found")

print("\nDone.")
