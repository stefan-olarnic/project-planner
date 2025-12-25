# Project Planner - Mini SaaS + QA Automation

## 📋 Description
Project management application with automated testing using Behave (BDD) and Playwright.

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd "mini SaaS + qa auto skills"
```

2. **Create virtual environment:**
```bash
cd automation
python -m venv .venv
```

3. **Activate virtual environment:**

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r ../requirements.txt
```

5. **Install Playwright browsers:**
```bash
playwright install chromium
```

## 🧪 Running Tests

### Run all tests:
```bash
cd automation
behave tests\bdd
```

### Run specific feature:
```bash
behave tests\bdd\feature_files\login.feature
```

### Run tests with tags:
```bash
behave tests\bdd --tags=@smoke
behave tests\bdd --tags=@login
behave tests\bdd --tags=@critical
```

## 📁 Project Structure
```
├── project-planner/          # Web application
│   ├── dashboard.html
│   ├── login.html
│   └── assets/
├── automation/               # Test automation
│   ├── pom/                 # Page Object Models
│   ├── tests/
│   │   └── bdd/
│   │       ├── feature_files/
│   │       └── steps/
│   └── .venv/               # Virtual environment (not in repo)
└── requirements.txt         # Python dependencies
```

## 🔧 Development Workflow

### Working on multiple machines:

1. **Push changes from current machine:**
```bash
git add .
git commit -m "Your message"
git push
```

2. **Pull changes on another machine:**
```bash
git pull
cd automation
# Activate .venv if not activated
pip install -r ../requirements.txt  # Update dependencies if changed
```

## 📝 Notes
- `.venv` is excluded from Git (it's machine-specific)
- Always activate virtual environment before running tests
- Screenshots are saved in `automation/tests/bdd/screenshots/`