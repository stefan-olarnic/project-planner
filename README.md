# Project Planner

A simple project management app with automated tests.

## What you need
- Python 3.10+
- Git

## Getting started

```bash
# Get the code
git clone <your-repo-url>
cd "mini SaaS + qa auto skills"

# Set up Python environment
cd automation
python -m venv .venv

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install stuff
pip install -r ../requirements.txt
playwright install chromium
```

## Running tests

```bash
# All tests
behave tests\bdd

# Specific feature
behave tests\bdd\feature_files\login.feature

# By tag
behave tests\bdd --tags=@smoke
```

## Project layout

```
project-planner/     - The actual app
automation/          - Tests go here
  pom/              - Page objects
  tests/bdd/        - Feature files and steps
```

## Working with Git

Push your changes:
```bash
git add .
git commit -m "what you changed"
git push
```

Pull on another machine:
```bash
git pull
cd automation
# activate .venv again
pip install -r ../requirements.txt
```

## Notes
- `.venv` is not in git, you make it on each machine
- Screenshots get saved in `automation/tests/bdd/screenshots/`
- Always activate the venv before running tests
