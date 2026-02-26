import sqlite3
import os
import datetime

db_path = 'neri.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

try:
    print("Adding task_date column to profession_tasks...")
    cursor.execute("ALTER TABLE profession_tasks ADD COLUMN task_date DATE")
    conn.commit()
    print("Column added successfully.")
except sqlite3.OperationalError as e:
    if "already exists" in str(e).lower():
        print("Column already exists.")
    else:
        print(f"Error adding column: {e}")

print("Backfilling task_date from created_at...")
cursor.execute("SELECT id, created_at FROM profession_tasks WHERE task_date IS NULL")
rows = cursor.fetchall()
for row in rows:
    # created_at is like '2026-02-25 04:43:17'
    try:
        date_part = row['created_at'].split(' ')[0]
        cursor.execute("UPDATE profession_tasks SET task_date = ? WHERE id = ?", (date_part, row['id']))
    except:
        today = datetime.date.today().isoformat()
        cursor.execute("UPDATE profession_tasks SET task_date = ? WHERE id = ?", (today, row['id']))

conn.commit()
print(f"Backfilled {len(rows)} rows.")

# Verify
cursor.execute("PRAGMA table_info(profession_tasks)")
cols = [r['name'] for r in cursor.fetchall()]
print(f"Current columns: {cols}")

conn.close()
