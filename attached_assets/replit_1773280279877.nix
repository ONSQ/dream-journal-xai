run = "sh start.sh"
entrypoint = "backend/main.py"

[nix]
channel = "stable-24_05"

[env]
PYTHONPATH = "/home/runner/$REPL_SLUG/backend"

[deployment]
run = ["sh", "-c", "sh start.sh"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80

[[ports]]
localPort = 5173
externalPort = 3000
