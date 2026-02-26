import sqlite3
import os

db_path = 'neri.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- profession_tasks columns ---")
cursor.execute("PRAGMA table_info(profession_tasks)")
for row in cursor.fetchall():
    print(dict(row))

print("\n--- profession_tasks sample rows ---")
cursor.execute("SELECT * FROM profession_tasks LIMIT 5")
for row in cursor.fetchall():
    print(dict(row))

conn.close()
