"""
Insurance Fraud Detection - FastAPI Backend
Loads trained ML pipeline and serves predictions via REST API.
"""

import os
import numpy as np
import pandas as pd
import joblib
import shap
import warnings

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR         = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR       = os.path.join(BASE_DIR, "..", "saved_models")
MODEL_PATH       = os.path.join(MODELS_DIR, "insurance_fraud_model.pkl")
METADATA_PATH    = os.path.join(MODELS_DIR, "model_metadata.pkl")
PREDICTIONS_PATH = os.path.join(MODELS_DIR, "insurance_fraud_predictions.csv")

# ── Load artifacts once at startup ─────────────────────────────────────────────
model    = joblib.load(MODEL_PATH)
metadata = joblib.load(METADATA_PATH)

THRESHOLD     = metadata["operational_threshold"]
MODEL_VERSION = metadata["model_version"]
MODEL_NAME    = metadata["model_name"]

# Extract preprocessor and classifier from pipeline
preprocessor = model.named_steps["preprocessor"]
classifier   = model.named_steps["classifier"]
feature_names = preprocessor.get_feature_names_out()

# Build SHAP explainer once
explainer = shap.TreeExplainer(classifier)

# ── Default Claim Values for Fallback Safety ──────────────────────────────────
DEFAULT_CLAIM_VALUES = {
    "Month": "Jan",
    "WeekOfMonth": 3,
    "DayOfWeek": "Monday",
    "Make": "Honda",
    "AccidentArea": "Urban",
    "DayOfWeekClaimed": "Monday",
    "MonthClaimed": "Jan",
    "WeekOfMonthClaimed": 3,
    "Sex": "Male",
    "MaritalStatus": "Single",
    "Age": 35,
    "Fault": "Policy Holder",
    "PolicyType": "Sedan - Liability",
    "VehicleCategory": "Sedan",
    "VehiclePrice": "20000 to 29000",
    "RepNumber": 5,
    "Deductible": 400,
    "DriverRating": 2,
    "Days_Policy_Accident": "more than 30",
    "Days_Policy_Claim": "more than 30",
    "PastNumberOfClaims": "none",
    "AgeOfVehicle": "3 years",
    "AgeOfPolicyHolder": "26 to 30",
    "PoliceReportFiled": "No",
    "WitnessPresent": "No",
    "AgentType": "External",
    "NumberOfSuppliments": "none",
    "AddressChange_Claim": "no change",
    "NumberOfCars": "1 vehicle",
    "Year": 1994,
    "BasePolicy": "Liability",
}

# ── Feature Engineering (mirrors notebook cells 35-40) ────────────────────────
DAYS_ORDINAL_MAP = {
    "none":          0,
    "1 to 7":        4,
    "8 to 15":       11,
    "15 to 30":      22,
    "more than 30":  45,
}

CLAIM_MAP = {"none": 0, "1": 1, "2": 2, "2 to 4": 2, "more than 2": 3, "more than 4": 4}

def convert_days(value) -> float:
    if pd.isna(value):
        return 0.0
    value = str(value).strip().lower()
    if value in DAYS_ORDINAL_MAP:
        return float(DAYS_ORDINAL_MAP[value])
    if "to" in value:
        try:
            parts = value.split("to")
            return (float(parts[0].strip()) + float(parts[1].strip())) / 2
        except Exception:
            return 0.0
    try:
        return float(value)
    except Exception:
        return 0.0

def extract_numeric(value) -> float:
    if pd.isna(value):
        return np.nan
    value = str(value).lower().strip()
    if value == "new":
        return 0.0
    numbers = []
    for token in value.replace("-", " ").split():
        try:
            numbers.append(float(token))
        except Exception:
            pass
    if len(numbers) == 1:
        return numbers[0]
    if len(numbers) >= 2:
        return float(np.mean(numbers[:2]))
    return np.nan

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering identical to notebook with default fallbacks."""
    df = df.copy()
    
    # Ensure all required default columns exist to prevent KeyError
    for col, default_val in DEFAULT_CLAIM_VALUES.items():
        if col not in df.columns or df[col].isnull().all():
            df[col] = default_val

    df["Days_Policy_Accident_Numeric"] = df["Days_Policy_Accident"].apply(convert_days)
    df["Days_Policy_Claim_Numeric"]    = df["Days_Policy_Claim"].apply(convert_days)
    df["Claim_Accident_Delay"] = (
        df["Days_Policy_Claim_Numeric"] - df["Days_Policy_Accident_Numeric"]
    ).clip(lower=0)
    df["Previous_Claims_Count"] = (
        df["PastNumberOfClaims"].astype(str).str.lower().map(CLAIM_MAP).fillna(0)
    )
    df["Vehicle_Age_Numeric"]   = df["AgeOfVehicle"].apply(extract_numeric)
    df["Vehicle_Price_Numeric"] = df["VehiclePrice"].apply(extract_numeric)
    df["No_Police_Report"] = (
        df["PoliceReportFiled"].astype(str).str.lower().map({"yes": 0, "no": 1}).fillna(1)
    )
    df["No_Witness"] = (
        df["WitnessPresent"].astype(str).str.lower().map({"yes": 0, "no": 1}).fillna(1)
    )
    return df

# ── Risk helpers ───────────────────────────────────────────────────────────────
def assign_risk(prob: float) -> str:
    if prob < 0.30:
        return "Low"
    elif prob < 0.60:
        return "Medium"
    return "High"

# ── Human-readable SHAP name mapping ──────────────────────────────────────────
FEATURE_LABEL_MAP = {
    "Days_Policy_Accident_Numeric":  "Time between policy start and accident",
    "Days_Policy_Claim_Numeric":     "Time between policy start and claim filing",
    "Claim_Accident_Delay":          "Delay between accident and claim filing",
    "Previous_Claims_Count":         "Number of previous claims",
    "Vehicle_Age_Numeric":           "Age of vehicle (years)",
    "Vehicle_Price_Numeric":         "Vehicle price range",
    "No_Police_Report":              "No police report filed",
    "No_Witness":                    "No witness present",
    "Age":                           "Age of policy holder",
    "DriverRating":                  "Driver risk rating",
    "Deductible":                    "Policy deductible amount",
    "RepNumber":                     "Representative number",
}

def human_readable(raw_name: str) -> str:
    clean = raw_name.replace("num__", "").replace("cat__", "")
    if clean in FEATURE_LABEL_MAP:
        return FEATURE_LABEL_MAP[clean]
    parts = clean.rsplit("_", 1)
    base = parts[0]
    if base in FEATURE_LABEL_MAP:
        return f"{FEATURE_LABEL_MAP[base]} = {parts[1] if len(parts) > 1 else ''}"
    return clean.replace("_", " ").title()

def generate_explanation(shap_vals: np.ndarray, top_n: int = 5) -> dict:
    df_exp = pd.DataFrame({
        "label":      [human_readable(n) for n in feature_names],
        "shap_value": shap_vals,
    })
    df_exp["abs"] = df_exp["shap_value"].abs()
    df_exp = df_exp.sort_values("abs", ascending=False).head(top_n * 2)

    risk_factors, protective_factors = [], []
    for _, row in df_exp.iterrows():
        entry = {
            "feature":      row["label"],
            "shap_value":   round(float(row["shap_value"]), 4),
            "analyst_note": (
                f"{row['label']} contributed to higher estimated risk."
                if row["shap_value"] > 0
                else f"{row['label']} reduced the estimated risk."
            ),
        }
        (risk_factors if row["shap_value"] > 0 else protective_factors).append(entry)

    return {
        "top_risk_factors":      risk_factors[:top_n],
        "top_protective_factors": protective_factors[:top_n],
    }

# ── Core prediction function ───────────────────────────────────────────────────
def predict(claim_data: dict, threshold: float = None) -> dict:
    t = threshold if threshold is not None else THRESHOLD
    df = pd.DataFrame([claim_data])
    df = engineer_features(df)

    probability = float(model.predict_proba(df)[0, 1])
    prediction  = int(probability >= t)
    risk_level  = assign_risk(probability)
    risk_score  = round(probability * 100, 2)

    transformed = preprocessor.transform(df)
    shap_vals   = explainer.shap_values(transformed)[0]
    explanation = generate_explanation(shap_vals)

    return {
        "fraud_probability":      probability,
        "risk_score":             risk_score,
        "risk_level":             risk_level,
        "prediction":             prediction,
        "top_risk_factors":       explanation["top_risk_factors"],
        "top_protective_factors": explanation["top_protective_factors"],
        "model_version":          MODEL_VERSION,
        "model_name":             MODEL_NAME,
        "threshold_used":         t,
    }
