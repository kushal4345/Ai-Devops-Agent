import os

folders = [
    "app/api/v1",
    "app/core",
    "app/models",
    "app/schemas",
    "app/services",
    "app/agents",
    "app/worker",
    "app/db",
    "tests"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)
    init_file = os.path.join(folder, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            pass

# Create empty entrypoint files
for file in ["app/main.py", ".env.example", ".gitignore"]:
    if not os.path.exists(file):
        with open(file, "w") as f:
            pass

print("Folder structure created successfully.")
