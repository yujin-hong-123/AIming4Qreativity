from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db

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
    return jsonify(message="calendar")

@app.route("/emergency")
def emergency():
    return jsonify(message="emergency")

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
