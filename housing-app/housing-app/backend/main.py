"""
FastAPI backend phục vụ mô hình định giá bất động sản.
Chạy: uvicorn main:app --reload --host 0.0.0.0 --port 8001
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import pandas as pd
import numpy as np
import joblib
import json
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")
CITY_LIST_PATH = os.path.join(BASE_DIR, "model", "city_list.json")

app = FastAPI(
    title="House Price Prediction API",
    description="API định giá bất động sản dựa trên diện tích, số phòng, vị trí",
    version="1.0.0",
)

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

try:
    CITY_LIST = json.load(open(CITY_LIST_PATH, encoding="utf-8"))
except FileNotFoundError:
    CITY_LIST = []


class HouseInput(BaseModel):
    area_m2: float = Field(..., gt=5, lt=1000, description="Diện tích (m²)")
    bedrooms: float = Field(..., ge=0, le=20, description="Số phòng ngủ")
    bathrooms: float = Field(..., ge=0, le=20, description="Số phòng tắm")
    floors: float = Field(..., ge=0, le=20, description="Số tầng")
    frontage: Literal[0, 1] = Field(..., description="0 = Không có mặt tiền, 1 = Có mặt tiền")
    city: str = Field(..., description="Tỉnh/Thành phố")

    class Config:
        json_schema_extra = {
            "example": {
                "area_m2": 60,
                "bedrooms": 3,
                "bathrooms": 2,
                "floors": 3,
                "frontage": 1,
                "city": "Hồ Chí Minh",
            }
        }


class PredictionOutput(BaseModel):
    predicted_price_million_vnd: float
    predicted_price_display: str
    price_per_m2_million_vnd: float
    city_used: str


def format_price(million_vnd: float) -> str:
    if million_vnd >= 1000:
        return f"{million_vnd / 1000:.2f} tỷ VND"
    return f"{million_vnd:.0f} triệu VND"


@app.get("/")
def root():
    return {"status": "ok", "message": "House Price Prediction API đang chạy"}


@app.get("/health")
def health():
    return {"model_loaded": model is not None, "n_cities": len(CITY_LIST)}


@app.get("/cities")
def get_cities():
    """Danh sách tỉnh/thành mô hình đã học riêng biệt (dùng để đổ vào dropdown FE)."""
    return {"cities": CITY_LIST}


@app.post("/predict", response_model=PredictionOutput)
def predict(house: HouseInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được nạp. Hãy chạy train_and_save_model.py trước.")

    # Các tỉnh/thành không nằm trong top khi huấn luyện sẽ được gộp vào 'Other'
    city_grp = house.city if house.city in CITY_LIST else "Other"

    row = pd.DataFrame([{
        "area_m2": house.area_m2,
        "bedrooms": house.bedrooms,
        "bathrooms": house.bathrooms,
        "floors": house.floors,
        "frontage": house.frontage,
        "city_grp": city_grp,
    }])

    pred_log = model.predict(row)[0]
    price_million = float(np.expm1(pred_log))
    price_million = max(price_million, 0.0)

    return PredictionOutput(
        predicted_price_million_vnd=round(price_million, 1),
        predicted_price_display=format_price(price_million),
        price_per_m2_million_vnd=round(price_million / house.area_m2, 2),
        city_used=city_grp,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
