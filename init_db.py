import sqlite3

connection = sqlite3.connect("railway.db")

with open("database.sql") as f:
    connection.executescript(f.read())

connection.commit()
connection.close()

print("Database initialized successfully.")