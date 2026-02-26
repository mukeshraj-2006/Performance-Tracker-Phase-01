import sqlite3
import os
from app import recalculate_daily_activity

db_path = 'neri.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
db = conn.cursor()

# Get all unique dates from all tables
dates = set()
for table, col in [('tasks', 'task_date'), ('nutrition_checklist', 'entry_date'), 
                   ('reminders', 'reminder_date'), ('physical_goals', 'goal_date'),
                   ('profession_tasks', 'task_date'), ('daily_activity', 'entry_date')]:
    try:
        rows = conn.execute(f"SELECT DISTINCT {col} FROM {table}").fetchall()
        for r in rows:
            if r[0]: dates.add(r[0])
    except:
        pass

print(f"Recalculating for {len(dates)} unique dates...")

# Get all user IDs
users = [r[0] for r in conn.execute("SELECT id FROM users").fetchall()]

for uid in users:
    for date_str in sorted(list(dates)):
        # Check if there is any data for this user on this date before recalculating
        # to avoid creating empty daily_activity records for every date for every user
        has_data = False
        for table, col in [('tasks', 'task_date'), ('nutrition_checklist', 'entry_date'), 
                           ('reminders', 'reminder_date'), ('physical_goals', 'goal_date'),
                           ('profession_tasks', 'task_date')]:
            row = conn.execute(f"SELECT 1 FROM {table} WHERE user_id=? AND {col}=? LIMIT 1", (uid, date_str)).fetchone()
            if row:
                has_data = True
                break
        
        if has_data:
            print(f"Updating data for user {uid} on {date_str}")
            recalculate_daily_activity(conn, uid, date_str)

conn.commit()
conn.close()
print("Recalculation complete.")
