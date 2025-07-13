from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
from db import init_db, get_db_connection

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

@app.route("/home")
def home():
    return jsonify(message="Home")

@app.route("/profile")
def profile():
    return jsonify(message="Profile")

@app.route("/reminder")
def reminder():
    return jsonify(message="Reminder")

@app.route("/calendar")
def calendar():
    return jsonify(message="Calendar")

@app.route("/log")
def log():
    return jsonify(message="Log")

@app.route("/start")
def start():
    return jsonify(message="Start")

@app.route("/api/users", methods=["POST"])
def upsert_user():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if a user already exists
    cursor.execute("SELECT id FROM users LIMIT 1")
    existing_user = cursor.fetchone()

    if existing_user:
        # Update existing user
        cursor.execute("""
            UPDATE users SET
                name = ?, age = ?, dementia_stage = ?,
                caretaker_name = ?, caretaker_relationship = ?, caretaker_number = ?,
                caretaker_email = ?, doctor_name = ?, doctor_email = ?
            WHERE id = ?
        """, (
            data["name"],
            data["age"],
            data["dementia_stage"],
            data["caretaker_name"],
            data["caretaker_relationship"],
            data["caretaker_number"],
            data["caretaker_email"],
            data["doctor_name"],
            data["doctor_email"],
            existing_user["id"]
        ))
    else:
        # Insert new user
        cursor.execute("""
            INSERT INTO users (
                name, age, dementia_stage,
                caretaker_name, caretaker_relationship, caretaker_number,
                caretaker_email, doctor_name, doctor_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["name"],
            data["age"],
            data["dementia_stage"],
            data["caretaker_name"],
            data["caretaker_relationship"],
            data["caretaker_number"],
            data["caretaker_email"],
            data["doctor_name"],
            data["doctor_email"]
        ))

    conn.commit()
    conn.close()
    return {"message": "User profile saved"}, 200

@app.route("/api/users", methods=["GET"])
def get_user():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users LIMIT 1")
    user = cursor.fetchone()
    conn.close()

    if user:
        return dict(user), 200
    else:
        return {"message": "No user found"}, 404


@app.route("/api/reminders", methods=["POST"])
def add_reminder():
    data = request.get_json()
    print("Reminder POST data:", data)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users LIMIT 1")
    user = cursor.fetchone()

    if not user:
        print("No user found in DB.")
        conn.close()
        return {"message": "No user exists"}, 400

    print("Inserting reminder for user_id:", user["id"])

    try:
        cursor.execute("""
            INSERT INTO reminders (user_id, time, label)
            VALUES (?, ?, ?)
        """, (
            user["id"],
            data["time"],
            data["label"],
        ))
        conn.commit()
        print("Reminder saved!")
        return {"message": "Reminder saved"}, 201
    except Exception as e:
        print("DB Error:", e)
        return {"message": "DB error occurred"}, 500
    finally:
        conn.close()


@app.route("/api/reminders", methods=["GET"])
def get_reminders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reminders")
    reminders = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(reminders)

@app.route("/run-audio-llm", methods=["POST"])
def run_audio_llm():
    try:
        # Assuming run-audio-llm.py is in the same directory as this Flask app
        script_path = os.path.join(os.path.dirname(__file__), "run-audio-llm.py")
        print(f"Running script: {script_path}")

        # Run the script using subprocess and capture both stdout and stderr
        result = subprocess.run(["python", script_path], capture_output=True, text=True)
        
        # Print outputs to the console for debugging
        print(f"stdout: {result.stdout}")
        print(f"stderr: {result.stderr}")

        if result.returncode == 0:
            return jsonify({"message": "Script executed successfully", "output": result.stdout}), 200
        else:
            return jsonify({"message": "Script failed", "error": result.stderr}), 500
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"message": "Error occurred", "error": str(e)}), 500


@app.route("/api/events", methods=["POST"])
def add_event():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users LIMIT 1")
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"message": "No user exists"}, 400

    try:
        cursor.execute("""
            INSERT INTO events (user_id, title, date)
            VALUES (?, ?, ?)
        """, (
            user["id"],
            data["title"],
            data["date"]
        ))
        conn.commit()
        return {"message": "Event saved"}, 201
    except Exception as e:
        print("DB Error:", e)
        return {"message": "Failed to save event"}, 500
    finally:
        conn.close()
        
@app.route("/api/events", methods=["GET"])
def get_events():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT title, date FROM events")
    rows = cursor.fetchall()
    events = [dict(row) for row in rows]

    conn.close()
    return jsonify(events)

@app.route("/api/logs", methods=["GET"])
def get_logs():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT date, description FROM logs ORDER BY date DESC")
    rows = cursor.fetchall()
    logs = [dict(row) for row in rows]

    conn.close()
    return jsonify(logs)

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

