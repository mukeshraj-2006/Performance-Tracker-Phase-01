CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    height REAL,
    weight REAL,
    blood_group TEXT,
    bmi REAL,
    daily_water_target_liters REAL DEFAULT 2.5
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,


    
    task_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS profession_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    technical_notes TEXT,
    leetcode_data JSON,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS daily_physical (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    water_intake_liters REAL DEFAULT 0.0,
    protein_intake_grams REAL DEFAULT 0.0,
    food_log TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, entry_date)
);

-- Professional task notebook (per-user, persistent – not date-bound)
CREATE TABLE IF NOT EXISTS profession_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Quick reminder sticky notes shown on Overview
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    reminder_date DATE,
    is_done BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Nutrition checklist items auto-suggested per day
CREATE TABLE IF NOT EXISTS nutrition_checklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    item_label TEXT NOT NULL,
    item_type TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
-- Daily activity points and tracking
CREATE TABLE IF NOT EXISTS daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_date DATE NOT NULL,
    physical_points INTEGER DEFAULT 0,
    profession_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    physical_completion_pct INTEGER DEFAULT 0,
    profession_total_count INTEGER DEFAULT 0,
    physical_total_count INTEGER DEFAULT 0,
    profession_completion_pct INTEGER DEFAULT 0,
    day_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, entry_date)
);

-- Physical goals/notes for scheduled dates (user-entered like "leg day", "meet doctor")
CREATE TABLE IF NOT EXISTS physical_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_date DATE NOT NULL,
    goal_title TEXT NOT NULL,
    goal_category TEXT DEFAULT 'general',
    goal_deadline TIME,
    goal_notes TEXT,
    completed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Suggested physical activities
CREATE TABLE IF NOT EXISTS physical_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_name TEXT NOT NULL,
    activity_category TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    UNIQUE(activity_name)
);

-- User's scheduled physical activities (when user selects from suggestions)
CREATE TABLE IF NOT EXISTS scheduled_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_date DATE NOT NULL,
    activity_name TEXT NOT NULL,
    activity_category TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);