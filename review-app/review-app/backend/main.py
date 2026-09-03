"""
FastAPI backend phục vụ mô hình dự đoán "khách hàng có recommend sản phẩm không"
dựa trên nội dung đánh giá (review text).
Chạy: uvicorn main:app --reload --host 0.0.0.0 --port 8002
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")

app = FastAPI(
    title="Review Recommendation Prediction API",
    description="API dự đoán khách hàng có recommend sản phẩm hay không, dựa trên nội dung đánh giá",
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
    classifier = model.steps[-1][1]
    if not hasattr(classifier, "multi_class"):
        classifier.multi_class = "auto"
except FileNotFoundError:
    model = None


class ReviewInput(BaseModel):
    title: str = Field("", description="Tiêu đề đánh giá (không bắt buộc)")
    review_text: str = Field(..., min_length=3, description="Nội dung đánh giá")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Love it!",
                "review_text": "This dress fits perfectly and the fabric feels amazing. Highly recommend!",
            }
        }


class PredictionOutput(BaseModel):
    recommended: int
    label: str
    probability: float
    sentiment_level: str


def sentiment_from_proba(p: float) -> str:
    if p < 0.35:
        return "Tiêu cực"
    if p < 0.65:
        return "Trung lập"
    return "Tích cực"


@app.get("/")
def root():
    return {"status": "ok", "message": "Review Recommendation Prediction API đang chạy"}


@app.get("/health")
def health():
    return {"model_loaded": model is not None}


@app.post("/predict", response_model=PredictionOutput)
def predict(review: ReviewInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được nạp. Hãy chạy train_and_save_model.py trước.")

    text = f"{review.title} . {review.review_text}".strip()
    proba = float(model.predict_proba([text])[0, 1])
    pred = int(proba >= 0.5)

    return PredictionOutput(
        recommended=pred,
        label="Khách hàng có khả năng recommend sản phẩm" if pred == 1 else "Khách hàng có khả năng KHÔNG recommend sản phẩm",
        probability=round(proba, 4),
        sentiment_level=sentiment_from_proba(proba),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
