#!/usr/bin/env python3
import subprocess, json, os

TF = os.path.expanduser("~/.hermes/state/coolify-api-key.txt")
tok = open(TF).read().strip()

uuid = "yxvg08txlg20u6kk1g4dql9a"
base = "http://127.0.0.1:8000/api/v1"

def api(method, path, data=None):
    h = ["Authorization: Bearer " + tok]
    cmd = ["curl", "-s", "-X", method, base + path, "-H", h[0]]
    if data:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return r.stdout

envs = api("GET", "/applications/" + uuid + "/envs")
for env in envs if isinstance(envs, list) else []:
    if env.get("key") == "DATABASE_URL":
        api("DELETE", "/applications/" + uuid + "/envs/" + str(env["uuid"]))

result = api("POST", "/applications/" + uuid + "/envs", {
    "key": "DATABASE_URL",
    "value": "postgres://generaia:***@generaia-app-db-1:5432/generaia",
    "is_literal": True,
    "is_preview": False
})

if isinstance(result, dict) and result.get("uuid"):
    print("OK")
else:
    print(str(result)[:200])
