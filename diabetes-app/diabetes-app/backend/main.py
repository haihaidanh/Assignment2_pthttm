"""
FastAPI backend phục vụ mô hình dự đoán nguy cơ tiểu đường.
Chạy: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import pandas as pd
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "model.pkl")

app = FastAPI(
    title="Diabetes Risk Prediction API",
    description="API dự đoán nguy cơ mắc tiểu đường dựa trên các chỉ số lâm sàng",
    version="1.0.0",
)

# Cho phép web (localhost / bất kỳ origin nào) và app mobile gọi API trong lúc demo.
# Khi triển khai thật, nên giới hạn allow_origins về đúng domain của bạn.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model = None


class PatientInput(BaseModel):
    gender: Literal["Male", "Female"]
    age: float = Field(..., ge=0, le=120, description="Tuổi")
    hypertension: Literal[0, 1] = Field(..., description="0 = Không, 1 = Có tăng huyết áp")
    heart_disease: Literal[0, 1] = Field(..., description="0 = Không, 1 = Có bệnh tim")
    smoking_history: Literal["never", "current", "former", "not current", "ever", "No Info"]
    bmi: float = Field(..., ge=5, le=100, description="Chỉ số khối cơ thể (BMI)")
    hbA1c_level: float = Field(..., ge=3, le=15, description="Chỉ số HbA1c")
    blood_glucose_level: float = Field(..., ge=50, le=400, description="Đường huyết (mg/dL)")

    class Config:
        json_schema_extra = {
            "example": {
                "gender": "Female",
                "age": 45,
                "hypertension": 0,
                "heart_disease": 0,
                "smoking_history": "never",
                "bmi": 27.3,
                "hbA1c_level": 6.1,
                "blood_glucose_level": 140,
            }
        }


class PredictionOutput(BaseModel):
    prediction: int
    label: str
    probability: float
    risk_level: str


def risk_level_from_proba(p: float) -> str:
    if p < 0.3:
        return "Thấp"
    if p < 0.6:
        return "Trung bình"
    return "Cao"


@app.get("/")
def root():
    return {"status": "ok", "message": "Diabetes Risk Prediction API đang chạy"}


@app.get("/health")
def health():
    return {"model_loaded": model is not None}


@app.post("/predict", response_model=PredictionOutput)
def predict(patient: PatientInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được nạp. Hãy chạy train_and_save_model.py trước.")

    row = pd.DataFrame([patient.model_dump()])
    proba = float(model.predict_proba(row)[0, 1])
    pred = int(proba >= 0.5)

    return PredictionOutput(
        prediction=pred,
        label="Có nguy cơ tiểu đường" if pred == 1 else "Không có nguy cơ tiểu đường",
        probability=round(proba, 4),
        risk_level=risk_level_from_proba(proba),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
