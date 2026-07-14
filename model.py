# ==========================================================
# EcoTrace Pro - Carbon Footprint ML Model Training
# ==========================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os


# -----------------------------
# Create Sample Training Data
# -----------------------------

data = {
    "travel_km": [
        10, 20, 50, 100, 150,
        200, 250, 300, 400, 500,
        600, 700, 800, 900, 1000
    ],

    "electricity_kwh": [
        50, 80, 120, 150, 200,
        250, 300, 350, 400, 450,
        500, 600, 700, 800, 900
    ],

    "food_score": [
        1, 2, 3, 2, 4,
        5, 4, 6, 7, 8,
        7, 9, 8, 10, 10
    ],

    "waste_kg": [
        2, 4, 5, 7, 10,
        12, 15, 18, 20, 25,
        30, 35, 40, 45, 50
    ],

    "carbon_emission": [
        40, 70, 130, 180, 260,
        330, 420, 500, 620, 760,
        900, 1050, 1200, 1350, 1500
    ]
}


df = pd.DataFrame(data)


print("\nTraining Dataset")
print(df.head())


# -----------------------------
# Features and Target
# -----------------------------

X = df[
    [
        "travel_km",
        "electricity_kwh",
        "food_score",
        "waste_kg"
    ]
]


y = df["carbon_emission"]


# -----------------------------
# Split Data
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# -----------------------------
# Train Model
# -----------------------------

model = LinearRegression()

model.fit(
    X_train,
    y_train
)


# -----------------------------
# Model Evaluation
# -----------------------------

prediction = model.predict(X_test)


accuracy = r2_score(
    y_test,
    prediction
)


error = mean_absolute_error(
    y_test,
    prediction
)


print("\nModel Performance")
print("----------------------")
print("R2 Score:", round(accuracy,2))
print("Mean Absolute Error:", round(error,2))


# -----------------------------
# Save Model
# -----------------------------

if not os.path.exists("models"):
    os.makedirs("models")


model_path = "models/carbon_model.pkl"


joblib.dump(
    model,
    model_path
)


print("\nModel Saved Successfully")
print(model_path)


# -----------------------------
# Test Prediction
# -----------------------------

sample = np.array(
    [
        [
            300,   # travel km
            250,   # electricity
            5,     # food score
            10     # waste
        ]
    ]
)


result = model.predict(sample)


print("\nSample Carbon Prediction:")
print(
    round(result[0],2),
    "kg CO2"
)