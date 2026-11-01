# 🛡️ ZeroGuard AI — AI-Powered Zero-Day Protection

> **Detect vulnerabilities. Understand risks. Fix with confidence.**

ZeroGuard AI is an AI-assisted cybersecurity platform designed to help developers identify potential security vulnerabilities in their source code, understand security risks, and get guidance for remediation.

By combining static code analysis with machine-learning-based analysis, ZeroGuard AI aims to make application security more accessible and help developers build safer software.

---

## 📌 Table of Contents

- [🚨 Problem Statement](#-problem-statement)
- [💡 Our Solution](#-our-solution)
- [✨ Key Features](#-key-features)
- [⚙️ How It Works](#️-how-it-works)
- [🏗️ System Architecture](#️-system-architecture)
- [🧰 Technology Stack](#-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🌐 Deployment](#-deployment)
- [🎯 Project Objectives](#-project-objectives)
- [🔮 Future Scope](#-future-scope)
- [👥 Team](#-team)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🚨 Problem Statement

Modern software applications are exposed to various security threats, including:

- Buffer overflows and memory-related vulnerabilities.
- Insecure input handling.
- Weak authentication mechanisms.
- Unsafe coding practices.
- Vulnerable code patterns.

Traditional security testing tools can identify potential vulnerabilities, but developers may still struggle to understand findings, choose appropriate fixes, and verify whether a remediation actually resolves the issue.

This creates a need for a more connected and developer-friendly security analysis workflow.

## 💡 Our Solution

**ZeroGuard AI** aims to simplify application security by combining static code scanning and machine-learning-based analysis.

The platform is designed to help developers:

1. Analyze source code for potential security weaknesses.
2. Identify suspicious or vulnerable code patterns.
3. Understand detected security issues.
4. Receive remediation guidance.
5. Recheck code after fixes and compare scan results.

Our goal is to move beyond simply identifying vulnerabilities and support developers throughout the security improvement process.

## ✨ Key Features

### 🔍 1. Automated Vulnerability Scanning
Uses Semgrep to analyze source code and identify potentially insecure coding patterns.

### 🧠 2. Machine Learning-Based Analysis
Integrates a machine-learning model based on the PrimeVul baseline to support security-related code analysis.

### ⚠️ 3. Security Issue Identification
Helps highlight potential vulnerabilities so developers can investigate and prioritize security concerns.

### 🛠️ 4. Remediation Guidance
Provides guidance to help developers understand and address identified security weaknesses.

### 🔄 5. Rescan and Verification Workflow
Supports the goal of checking code again after remediation and comparing results to assess whether identified issues remain.

### 📊 6. Developer-Friendly Interface
Provides a web-based interface to make security analysis easier to access and understand.

---

## ⚙️ How It Works

The intended ZeroGuard AI workflow:

```text
       👨‍💻 Developer
             |
             v
       Upload / Submit Code
             |
             v
      ⚙️ FastAPI Backend
             |
       +-----+------+
       |            |
       v            v
  🔍 Semgrep     🧠 ML Model
  Analysis      Analysis
       |            |
       +-----+------+
             |
             v
     ⚠️ Security Findings
             |
             v
      🛠️ Remediation Guidance
             |
             v
        🔄 Rescan Code
             |
             v
      📊 Compare Results
```

*Note: The exact execution and verification stages depend on the capabilities enabled in the current implementation.*

---

## 🏗️ System Architecture

ZeroGuard AI follows a frontend-backend architecture.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React | User interface and application pages |
| Frontend Language | TypeScript | Type-safe frontend development |
| Backend | Python, FastAPI | API endpoints and application logic |
| Security Scanner | Semgrep | Static source-code analysis |
| Machine Learning | Scikit-learn | ML-based analysis support |
| Model Storage | Joblib | Saving and loading the trained model |
| ML Model | PrimeVul Baseline | Security-related code analysis |
| Version Control | Git, GitHub | Source-code management |
| Frontend Hosting | Netlify | Frontend deployment |
| Backend Hosting | Render | Backend deployment |

---

## 🧰 Technology Stack

### Frontend
- Next.js
- React.js
- TypeScript

### Backend
- Python
- FastAPI

### Security & Machine Learning
- Semgrep
- Scikit-learn
- Joblib
- PrimeVul baseline model

### Development & Deployment
- Git
- GitHub
- Netlify
- Render

---

## 📂 Project Structure

```text
ZeroGuard-AI/
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── ml/
│   └── models/
│       └── primevul_baseline.joblib
│
├── .gitignore
└── README.md
```

*The structure above shows the main project components. Individual files and folders may differ as development progresses.*

---

## 🚀 Getting Started

Follow these steps to run ZeroGuard AI locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Shivamkumar2812/Zero-guard-Ai-.git
```

### 2. Navigate to the Project

```bash
cd Zero-guard-Ai-
```

### 3. Set Up the Backend

Open a terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Set Up the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the backend API URL using the environment variable expected by the frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🌐 Deployment

ZeroGuard AI uses the following deployment services:

| Component | Platform |
|---|---|
| Frontend | Netlify |
| Backend API | Render |
| Source Code | GitHub |

Deployment configuration should use the appropriate frontend and backend environment variables.

---

## 🎯 Project Objectives

- Make source-code security analysis more accessible.
- Help developers identify potentially vulnerable code.
- Combine static analysis with machine-learning-based analysis.
- Provide understandable remediation guidance.
- Encourage verification of security fixes.
- Promote secure software development practices.

---

## 🔮 Future Scope

The project can be extended with:

- 🤖 More advanced AI-assisted remediation.
- 🔁 Automated security-test replay after code changes.
- 🧪 Regression testing to check legitimate application functionality.
- 📈 Detailed vulnerability analytics and reporting.
- 🔐 Dependency and secret scanning integration.
- 🚨 Continuous security monitoring.
- 🔗 CI/CD pipeline integration.
- 📊 Improved vulnerability prioritization and explainability.

---

## 👥 Team

**Team Name:** Codecrafters

**Project:** ZeroGuard AI — AI-Powered Zero-Day Protection

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Commit and push your changes.
5. Open a Pull Request.

---

## 📄 License

This project is developed for educational, research, and hackathon purposes.

A formal open-source license can be added when the project licensing terms are decided.

---

<div align="center">

### 🛡️ ZeroGuard AI

**Building a safer digital future, one vulnerability at a time.**

*Detect • Analyze • Remediate • Verify*

</div>
