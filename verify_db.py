import sqlite3
import datetime

db = sqlite3.connect('neri.db')
db.row_factory = sqlite3.Row

print("=== Checking daily_activity Schema ===")
cursor = db.execute("PRAGMA table_info(daily_activity)")
columns = [row['name'] for row in cursor.fetchall()]
print(f"Columns: {columns}")

if 'profession_completion_pct' in columns:
    print("SUCCESS: profession_completion_pct exists.")
else:
    print("FAILURE: profession_completion_pct MISSING.")

print("\n=== Recent daily_activity Data ===")
rows = db.execute("SELECT entry_date, physical_completion_pct, profession_completion_pct, total_points FROM daily_activity ORDER BY entry_date DESC LIMIT 5").fetchall()
for r in rows:
    print(f"Date: {r['entry_date']} | Phys: {r['physical_completion_pct']}% | Prof: {r['profession_completion_pct']}% | Points: {r['total_points']}")

db.close()
