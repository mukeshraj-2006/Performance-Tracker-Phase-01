📊 Performance Tracker – Phase 01

A professional performance tracking web application built with Flask, SQLite, HTML, CSS, and JavaScript.
This system enables structured performance monitoring with authentication, categorized views, and dynamic dashboards.

🚀 Overview

Performance Tracker is a modular web-based system designed to manage and analyze user performance across multiple categories such as:

Physical Performance

Professional Metrics

Overview Dashboard

The application follows a clean MVC-inspired structure using Flask backend with Jinja templates and SQLite database integration.

✨ Features

📊 Performance Dashboard — Consolidated overview of all performance metrics
📁 Category-Based Tracking — Separate modules for Physical & Professional tracking
🔐 Authentication System — Secure login system using Flask sessions
🗄️ SQLite Database Integration — Lightweight and efficient local database
📈 Dynamic Data Rendering — Real-time updates from database to UI
🧩 Modular Architecture — Clean separation of templates, static files, and backend logic
🎥 Launch Media Support — Integrated launch page video support
🛠️ Database Utilities — Schema management, verification scripts, recalculation modules
📱 Responsive UI — Clean and adaptable layout across devices
🔄 Migration Support — Profession date migration handling script
🧪 Database Diagnostics — Built-in database verification tools

🗂️ Project Structure

Performance_Tracker_Phase_01/
│
├── __pycache__/                 # Compiled Python files
│
├── assets/
│   └── Launch page.mp4          # Intro / launch media
│
├── static/
│   ├── css/
│   │   └── style.css            # Application styling
│   └── js/
│       └── script.js            # Frontend interactivity
│
├── templates/
│   ├── auth.html                # Login page
│   ├── base.html                # Base template layout
│   ├── overview.html            # Dashboard overview
│   ├── physical.html            # Physical performance page
│   └── profession.html          # Professional metrics page
│
├── app.py                       # Main Flask application
├── database.py                  # Database connection & logic
├── diag.py                      # Diagnostic logic
├── diag_db.py                   # Database diagnostics
├── migrate_profession_date.py   # Data migration utility
├── recalculate_all.py           # Performance recalculation script
├── verify_db.py                 # Database integrity checker
├── schema.sql                   # Database schema definition
├── neri.db                      # SQLite database file
│
└── README.md

🛠️ Tech Stack
Layer	Technology
Backend	Python, Flask
Database	SQLite
Frontend	HTML5, CSS3, JavaScript
Templating	Jinja2
Media	MP4 Launch Integration
🚀 Getting Started
📌 Prerequisites

Python 3.10+

pip (Python package manager)

🔧 Installation
1️⃣ Clone the repository
git clone https://github.com/mukeshraj-2006/Performance-Tracker-Phase-01.git
cd Performance-Tracker-Phase-01
2️⃣ Create virtual environment (Recommended)
python -m venv venv
venv\Scripts\activate   # Windows
3️⃣ Install dependencies
pip install flask

(If you create a requirements.txt, you can install via pip install -r requirements.txt)

▶️ Running the Application
python app.py

Then open your browser and navigate to:

http://127.0.0.1:5000
🔐 Authentication

The system uses a login-based authentication flow.

Access Control Includes:

Secure session handling

Restricted dashboard access

Template-level route protection

(You can customize credentials inside the database.)

📊 Application Modules
🏠 Overview

Displays consolidated performance metrics and summaries.

🏋️ Physical

Tracks physical activity performance and metrics.

💼 Professional

Tracks professional development and career-related performance data.

🗄️ Database Management

The project includes utility scripts for database maintenance:

Script	Purpose
schema.sql	Defines database structure
verify_db.py	Validates database integrity
diag_db.py	Performs diagnostics
recalculate_all.py	Recalculates performance metrics
migrate_profession_date.py	Handles date migration
🔄 Database Setup (If Fresh Install)

If starting without neri.db:

sqlite3 neri.db < schema.sql
📦 Future Enhancements

Role-based access control

Data visualization with Chart.js

Export to Excel / PDF

REST API endpoints

Deployment with Docker

Cloud database support

🧠 Architecture Highlights

Clean separation of backend and frontend layers

Modular template inheritance using base.html

Organized static asset management

Dedicated database utility scripts

Scalable foundation for Phase-02 expansion

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Mukesh Raj
GitHub: https://github.com/mukeshraj-2006
