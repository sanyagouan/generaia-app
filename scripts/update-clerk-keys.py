#!/usr/bin/env python3
"""Update Clerk production keys in Coolify."""
import subprocess, json, os

TF = os.path.expanduser("~/.hermes/state/coolify-api-key.txt")
tok = open(TF).read().strip()
uuid = "yxvg08txlg20u6kk1g4dql9a"
base = "http://127.0.0.1:8000/api/v1"
hdr = "Authorization: Bearer %s" % tok

def api(method, path, data=None):
    cmd = ["curl", "-s", "-X", method, base + path, "-H", hdr]
    if data:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return r.stdout

# 1. Delete old Clerk keys
envs = api("GET", "/applications/" + uuid + "/envs")
for env in envs if isinstance(envs, list) else []:
    k = env.get("key", "")
    if k in ("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"):
        api("DELETE", "/applications/" + uuid + "/envs/" + str(env["uuid"]))
        print("Deleted:", k)

# 2. Set production keys
updates = [
    ("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_live_Y2xlcmsuZ2VuZXJhaWEub3JnJA"),
    ("CLERK_SECRET_KEY", "...6i"),
]

for key, val in updates:
    result = api("POST", "/applications/" + uuid + "/envs", {
        "key": key, "value": val,
        "is_literal": True, "is_preview": False
    })
    status = "OK" if isinstance(result, dict) and result.get("uuid") else "FAIL"
    print(status + ":", key)
