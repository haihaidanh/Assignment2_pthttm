"""
Huấn luyện mô hình TF-IDF + Logistic Regression dự đoán khách hàng có
recommend sản phẩm hay không dựa trên nội dung đánh giá (review text).
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score

DATA_PATH = "reviews.csv"

def main():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["Review Text"])
    # gộp Title + Review Text để mô hình tận dụng cả 2
    df["Title"] = df["Title"].fillna("")
    df["text"] = (df["Title"] + " . " + df["Review Text"]).str.strip()

    X = df["text"]
    y = df["Recommended IND"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=20000,
            ngram_range=(1, 2),
            min_df=2,
            stop_words="english",
        )),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", C=3.0, random_state=42)),
    ])

    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]
    print(classification_report(y_test, y_pred, digits=4))
    print("ROC-AUC:", round(roc_auc_score(y_test, y_proba), 4))

    joblib.dump(pipe, "model/model.pkl")
    print("Đã lưu model tại model/model.pkl")

if __name__ == "__main__":
    main()
