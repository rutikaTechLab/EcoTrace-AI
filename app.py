# ==========================================================
# EcoTrace Pro - Carbon Footprint Calculator Backend
# Flask + SQLite + Machine Learning
# ==========================================================

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import joblib
import os
from datetime import datetime


# ----------------------------------------------------------
# Flask Configuration
# ----------------------------------------------------------

app = Flask(__name__)

CORS(app)


# ----------------------------------------------------------
# Load Machine Learning Model
# ----------------------------------------------------------

MODEL_PATH = "models/carbon_model.pkl"

model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    print("Model not found. Run model.py first.")



# ----------------------------------------------------------
# Database Setup
# ----------------------------------------------------------

DATABASE = "carbon.db"


def create_database():

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()


    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT,

        travel REAL,

        electricity REAL,

        food REAL,

        waste REAL,

        carbon REAL,

        rating TEXT,

        date TEXT

    )
    """)


    conn.commit()

    conn.close()



create_database()



# ----------------------------------------------------------
# Carbon Rating System
# ----------------------------------------------------------

def carbon_rating(value):

    if value < 200:
        return "🌱 Excellent"

    elif value < 500:
        return "😊 Good"

    elif value < 900:
        return "⚠ Moderate"

    else:
        return "🔥 Critical"



# ----------------------------------------------------------
# Reduction Tips
# ----------------------------------------------------------

def get_tips(value):

    tips=[]


    if value > 500:

        tips.append(
            "Use public transport or cycling for short distances."
        )

        tips.append(
            "Reduce electricity consumption using LED appliances."
        )

        tips.append(
            "Choose more plant-based meals."
        )

        tips.append(
            "Recycle waste materials whenever possible."
        )


    else:

        tips.append(
            "Great job! Continue your eco-friendly lifestyle."
        )

        tips.append(
            "Plant trees and encourage others."
        )


    return tips



# ----------------------------------------------------------
# Home Page
# ----------------------------------------------------------

@app.route("/")
def home():

    return render_template(
        "index.html"
    )



# ----------------------------------------------------------
# Carbon Prediction API
# ----------------------------------------------------------

@app.route(
    "/calculate",
    methods=["POST"]
)

def calculate():


    data=request.json


    name=data.get(
        "name",
        "User"
    )


    travel=float(
        data.get(
            "travel",
            0
        )
    )


    electricity=float(
        data.get(
            "electricity",
            0
        )
    )


    food=float(
        data.get(
            "food",
            0
        )
    )


    waste=float(
        data.get(
            "waste",
            0
        )
    )



    # ML Prediction

    if model:

        prediction=model.predict(
            [
                [
                    travel,
                    electricity,
                    food,
                    waste
                ]
            ]
        )


        carbon=round(
            float(prediction[0]),
            2
        )


    else:

        carbon=(
            travel*0.21
            +
            electricity*0.45
            +
            food*50
            +
            waste*2
        )



    rating=carbon_rating(
        carbon
    )


    tips=get_tips(
        carbon
    )



    # Save Data

    conn=sqlite3.connect(
        DATABASE
    )

    cursor=conn.cursor()


    cursor.execute(
        """
        INSERT INTO history
        (
        name,
        travel,
        electricity,
        food,
        waste,
        carbon,
        rating,
        date
        )

        VALUES (?,?,?,?,?,?,?,?)

        """,

        (
            name,
            travel,
            electricity,
            food,
            waste,
            carbon,
            rating,
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )

    )


    conn.commit()

    conn.close()



    return jsonify(

        {
            "success":True,

            "carbon":carbon,

            "rating":rating,

            "tips":tips

        }

    )



# ----------------------------------------------------------
# History API
# ----------------------------------------------------------

@app.route(
    "/history"
)

def history():


    conn=sqlite3.connect(
        DATABASE
    )


    cursor=conn.cursor()


    cursor.execute(
        """
        SELECT *
        FROM history
        ORDER BY id DESC
        LIMIT 10
        """
    )


    rows=cursor.fetchall()


    conn.close()



    result=[]


    for row in rows:

        result.append(

            {
                "name":row[1],

                "carbon":row[6],

                "rating":row[7],

                "date":row[8]

            }

        )


    return jsonify(result)




# ----------------------------------------------------------
# Run Server
# ----------------------------------------------------------

if __name__=="__main__":

    app.run(

        debug=True,

        host="0.0.0.0",

        port=5000

    )