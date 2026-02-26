import sqlite3
import datetime

db = sqlite3.connect('neri.db')
db.row_factory = sqlite3.Row
today = datetime.date.today().isoformat()

print("=== daily_activity records ===")
rows = db.execute('SELECT entry_date, physical_completion_pct, total_points, day_note FROM daily_activity ORDER BY entry_date').fetchall()
for r in rows:
    print(f"  {r['entry_date']}: phys={r['physical_completion_pct']}%, points={r['total_points']}, note={r['day_note']}")

print("\n=== nutrition_checklist dates ===")
rows2 = db.execute("SELECT entry_date, COUNT(*) as cnt, SUM(is_checked) as done FROM nutrition_checklist GROUP BY entry_date ORDER BY entry_date").fetchall()
for r in rows2:
    print(f"  {r['entry_date']}: {r['cnt']} items, {r['done']} checked")

print("\n=== tasks dates ===")
rows3 = db.execute("SELECT task_date, COUNT(*) as cnt, SUM(is_completed) as done FROM tasks GROUP BY task_date ORDER BY task_date").fetchall()
for r in rows3:
    print(f"  {r['task_date']}: {r['cnt']} tasks, {r['done']} done")

print("\n=== physical_goals dates ===")
rows4 = db.execute("SELECT goal_date, COUNT(*) as cnt FROM physical_goals GROUP BY goal_date ORDER BY goal_date").fetchall()
for r in rows4:
    print(f"  {r['goal_date']}: {r['cnt']} goals")

print("\n=== reminders dates ===")
rows5 = db.execute("SELECT reminder_date, COUNT(*) as cnt FROM reminders GROUP BY reminder_date ORDER BY reminder_date").fetchall()
for r in rows5:
    print(f"  {r['reminder_date']}: {r['cnt']} reminders")

print("\n=== profession_tasks ===")
rows6 = db.execute("SELECT COUNT(*) as total, SUM(is_completed) as done FROM profession_tasks").fetchone()
print(f"  total={rows6['total']}, done={rows6['done']}")

db.close()
print("\nDone.")
