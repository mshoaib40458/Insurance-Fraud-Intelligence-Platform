"""
Insurance Fraud Detection - FastAPI Application
Endpoints:
  GET  /                    - health check
  GET  /model/info          - model metadata
  POST /predict             - single claim prediction
  POST /predict/batch       - batch CSV upload prediction
  GET  /claims              - paginated claims list
  GET  /claims/{policy_no}  - single claim detail
  GET  /analytics/summary   - dashboard summary stats
  GET  /analytics/risk-dist - risk distribution
"""

import os
import io
import json
import math
import numpy as np
import pandas as pd
from typing import Optional, List, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field

from ml_service import (
    predict, metadata, MODEL_VERSION, MODEL_NAME,
    THRESHOLD, PREDICTIONS_PATH, assign_risk
)
from auth import (
    authenticate_user, create_access_token, get_current_user,
    Token, UserOut, USERS_DB
)

# ── App setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Insurance Fraud Detection API",
    description="ML-powered insurance claim risk assessment service",
    version=MODEL_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load predictions CSV (acts as our data store) ─────────────────────────────
_predictions_df: pd.DataFrame = None

def get_predictions_df() -> pd.DataFrame:
    global _predictions_df
    if _predictions_df is None:
        if os.path.exists(PREDICTIONS_PATH):
            _predictions_df = pd.read_csv(PREDICTIONS_PATH)
        else:
            _predictions_df = pd.DataFrame()
    return _predictions_df

# ── Pydantic schemas ───────────────────────────────────────────────────────────
class ClaimInput(BaseModel):
    Month:               Optional[str]   = "Jan"
    WeekOfMonth:         Optional[int]   = 3
    DayOfWeek:           Optional[str]   = "Monday"
    Make:                Optional[str]   = "Honda"
    AccidentArea:        Optional[str]   = "Urban"
    DayOfWeekClaimed:    Optional[str]   = "Monday"
    MonthClaimed:        Optional[str]   = "Jan"
    WeekOfMonthClaimed:  Optional[int]   = 3
    Sex:                 Optional[str]   = "Male"
    MaritalStatus:       Optional[str]   = "Single"
    Age:                 Optional[int]   = 35
    Fault:               Optional[str]   = "Policy Holder"
    PolicyType:          Optional[str]   = "Sedan - Liability"
    VehicleCategory:     Optional[str]   = "Sedan"
    VehiclePrice:        Optional[str]   = "20000 to 29000"
    PolicyNumber:        Optional[int]   = None
    RepNumber:           Optional[int]   = 5
    Deductible:          Optional[int]   = 400
    DriverRating:        Optional[int]   = 2
    Days_Policy_Accident: Optional[str] = "more than 30"
    Days_Policy_Claim:   Optional[str]  = "more than 30"
    PastNumberOfClaims:  Optional[str]  = "none"
    AgeOfVehicle:        Optional[str]  = "3 years"
    AgeOfPolicyHolder:   Optional[str]  = "26 to 30"
    PoliceReportFiled:   Optional[str]  = "No"
    WitnessPresent:      Optional[str]  = "No"
    AgentType:           Optional[str]  = "External"
    NumberOfSuppliments: Optional[str]  = "none"
    AddressChange_Claim: Optional[str]  = "no change"
    NumberOfCars:        Optional[str]  = "1 vehicle"
    Year:                Optional[int]  = 1994
    BasePolicy:          Optional[str]  = "Liability"

class PredictionResponse(BaseModel):
    policy_number:           Optional[int]
    fraud_probability:       float
    risk_score:              float
    risk_level:              str
    prediction:              int
    top_risk_factors:        List[Any]
    top_protective_factors:  List[Any]
    model_version:           str
    model_name:              str
    threshold_used:          float

class ModelInfo(BaseModel):
    model_name:              str
    model_version:           str
    operational_threshold:   float
    risk_bands:              dict
    brier_score_before:      float
    brier_score_after:       float
    claim_amount_in_dataset: bool

# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health():
    return {
        "status":  "ok",
        "service": "Insurance Fraud Detection API",
        "version": MODEL_VERSION,
        "model":   MODEL_NAME,
    }


# ── Auth Endpoints ─────────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with username and password. Returns JWT access token."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user["username"]})
    return Token(
        access_token=token,
        token_type="bearer",
        user={
            "username":  user["username"],
            "full_name": user["full_name"],
            "email":     user["email"],
            "role":      user["role"],
        },
    )


@app.get("/auth/me", response_model=UserOut, tags=["Auth"])
def get_me(current_user: dict = Depends(get_current_user)):
    """Return currently authenticated user info."""
    return UserOut(**{k: current_user[k] for k in UserOut.model_fields})


@app.post("/auth/logout", tags=["Auth"])
def logout():
    """Logout (client should discard the token)."""
    return {"message": "Logged out successfully"}


@app.get("/model/info", response_model=ModelInfo, tags=["Model"])
def model_info():
    return ModelInfo(
        model_name=metadata["model_name"],
        model_version=metadata["model_version"],
        operational_threshold=metadata["operational_threshold"],
        risk_bands=metadata["risk_bands"],
        brier_score_before=metadata["brier_score_before_calibration"],
        brier_score_after=metadata["brier_score_after_calibration"],
        claim_amount_in_dataset=metadata["claim_amount_in_dataset"],
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_single(claim: ClaimInput, threshold: Optional[float] = Query(None), _: dict = Depends(get_current_user)):
    """
    Predict fraud risk for a single claim.
    Optionally override the threshold via query param: ?threshold=0.15
    """
    try:
        data = claim.model_dump()
        policy_number = data.pop("PolicyNumber", None)
        result = predict(data, threshold=threshold)
        return PredictionResponse(policy_number=policy_number, **result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", tags=["Prediction"])
async def predict_batch(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    """
    Batch prediction: upload a CSV file.
    CSV must contain same columns as ClaimInput.
    Returns predictions for all rows.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV read error: {e}")

    results = []
    for _, row in df.iterrows():
        try:
            claim_dict = row.to_dict()
            policy_no  = claim_dict.pop("PolicyNumber", None)
            result     = predict(claim_dict)
            result["policy_number"] = policy_no
            results.append(result)
        except Exception as e:
            results.append({"error": str(e), "policy_number": row.get("PolicyNumber")})

    return {"total": len(results), "predictions": results}


@app.get("/claims", tags=["Claims"])
def list_claims(
    page:       int   = Query(1,   ge=1),
    page_size:  int   = Query(20,  ge=1, le=100),
    risk_level: Optional[str]   = Query(None, description="Low | Medium | High"),
    min_prob:   Optional[float] = Query(None, ge=0.0, le=1.0),
    max_prob:   Optional[float] = Query(None, ge=0.0, le=1.0),
    sort_by:    str   = Query("Fraud_Probability", description="Column to sort by"),
    sort_desc:  bool  = Query(True),
    _: dict = Depends(get_current_user),
):
    """
    Paginated list of all test-set claims with predictions.
    Filterable by risk_level, probability range.
    """
    df = get_predictions_df()
    if df.empty:
        return {"total": 0, "page": page, "page_size": page_size, "claims": []}

    # Filters
    if risk_level:
        df = df[df["Risk_Level"].str.lower() == risk_level.lower()]
    if min_prob is not None:
        df = df[df["Fraud_Probability"] >= min_prob]
    if max_prob is not None:
        df = df[df["Fraud_Probability"] <= max_prob]

    # Sort
    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=not sort_desc)

    total = len(df)
    start = (page - 1) * page_size
    end   = start + page_size
    page_df = df.iloc[start:end]

    return {
        "total":     total,
        "page":      page,
        "page_size": page_size,
        "pages":     math.ceil(total / page_size),
        "claims":    page_df.to_dict(orient="records"),
    }


@app.get("/claims/search", tags=["Claims"])
def search_claims(
    q:         Optional[str]   = Query(None, description="Claim index to search"),
    risk_level: Optional[str]  = Query(None),
    min_prob:  Optional[float] = Query(None),
    max_prob:  Optional[float] = Query(None),
    _: dict = Depends(get_current_user),
):
    """Search/filter claims."""
    df = get_predictions_df()
    if df.empty:
        return {"results": []}

    if q:
        try:
            df = df[df["Claim_Index"] == int(q)]
        except ValueError:
            pass
    if risk_level:
        df = df[df["Risk_Level"].str.lower() == risk_level.lower()]
    if min_prob is not None:
        df = df[df["Fraud_Probability"] >= min_prob]
    if max_prob is not None:
        df = df[df["Fraud_Probability"] <= max_prob]

    return {"total": len(df), "results": df.head(50).to_dict(orient="records")}


@app.get("/claims/{claim_index}", tags=["Claims"])
def get_claim(claim_index: int, _: dict = Depends(get_current_user)):
    """Get individual claim detail with risk info."""
    df = get_predictions_df()
    if df.empty:
        raise HTTPException(status_code=404, detail="No predictions loaded")

    row = df[df["Claim_Index"] == claim_index]
    if row.empty:
        raise HTTPException(status_code=404, detail=f"Claim {claim_index} not found")

    return row.iloc[0].to_dict()


@app.get("/analytics/summary", tags=["Analytics"])
def analytics_summary(_: dict = Depends(get_current_user)):
    """Dashboard summary: counts, averages, risk distribution."""
    df = get_predictions_df()
    if df.empty:
        return {}

    total        = len(df)
    high_risk    = int((df["Risk_Level"] == "High").sum())
    medium_risk  = int((df["Risk_Level"] == "Medium").sum())
    low_risk     = int((df["Risk_Level"] == "Low").sum())
    avg_prob     = round(float(df["Fraud_Probability"].mean()) * 100, 2)
    actual_fraud = int(df["Actual_Fraud"].sum()) if "Actual_Fraud" in df.columns else None
    fraud_rate   = round(actual_fraud / total * 100, 2) if actual_fraud else None

    return {
        "total_claims":     total,
        "high_risk_claims": high_risk,
        "medium_risk_claims": medium_risk,
        "low_risk_claims":  low_risk,
        "avg_fraud_probability_pct": avg_prob,
        "actual_fraud_count": actual_fraud,
        "actual_fraud_rate_pct": fraud_rate,
        "model_name":       MODEL_NAME,
        "model_version":    MODEL_VERSION,
        "threshold":        THRESHOLD,
    }


@app.get("/analytics/risk-dist", tags=["Analytics"])
def risk_distribution(_: dict = Depends(get_current_user)):
    """Risk level distribution counts and percentages."""
    df = get_predictions_df()
    if df.empty:
        return {}

    counts = df["Risk_Level"].value_counts().to_dict()
    total  = len(df)
    return {
        level: {
            "count":      counts.get(level, 0),
            "percentage": round(counts.get(level, 0) / total * 100, 2)
        }
        for level in ["High", "Medium", "Low"]
    }


@app.get("/analytics/top-risk", tags=["Analytics"])
def top_risk_claims(n: int = Query(10, ge=1, le=100), _: dict = Depends(get_current_user)):
    """Top N highest-risk claims."""
    df = get_predictions_df()
    if df.empty:
        return {"claims": []}
    top = df.sort_values("Fraud_Probability", ascending=False).head(n)
    return {"claims": top.to_dict(orient="records")}
