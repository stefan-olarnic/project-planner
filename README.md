# Project Planner

A simple project management app with automated scripts.

## Getting started

```bash
# Get the code
git clone <your-repo-url>
cd "mini SaaS + qa auto skills"

# Set up Python environment
cd automation
python -m venv .venv

# Activate it
.venv\Scripts\activate

# Install requirements and playwright chromium
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
automation/          - Automated scripts
  pom/              - Page objects
  tests/bdd/        - Feature files and steps
```

## Notes
- Screenshots get saved in `automation/tests/bdd/screenshots/`
