"""
Huấn luyện mô hình Random Forest Regressor định giá nhà và lưu thành model.pkl
(bao gồm cả bước tiền xử lý - preprocessing pipeline - trong cùng 1 file pickle)
"""
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = "house_buying_dec29th_2025.csv"

NUM_FEATS = ["area_m2", "bedrooms", "bathrooms", "floors"]
BIN_FEATS = ["frontage"]
CAT_FEATS = ["city_grp"]
ALL_FEATS = NUM_FEATS + BIN_FEATS + CAT_FEATS
TARGET = "price_million_vnd"
TOP_N_CITY = 15

def main():
    df = pd.read_csv(DATA_PATH)
    df["city"] = df["location"].str.split(",").str[-1].str.strip()

    df = df[
        (df.price_million_vnd > 0) & (df.price_million_vnd < 200_000) &
        (df.area_m2 > 5) & (df.area_m2 < 1000)
    ].copy()

    for c in ["bedrooms", "bathrooms", "floors"]:
        df[c] = df[c].fillna(df[c].median())
    df = df.dropna(subset=["area_m2", "price_million_vnd"])

    top_cities = df["city"].value_counts().head(TOP_N_CITY).index.tolist()
    df["city_grp"] = df["city"].where(df["city"].isin(top_cities), "Other")

    # lưu danh sách city hợp lệ để dùng lại cho API (dropdown / validate)
    json.dump(sorted(top_cities), open("model/city_list.json", "w"), ensure_ascii=False, indent=2)

    X = df[ALL_FEATS]
    y = np.log1p(df[TARGET])  # hồi quy trên thang log

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocess = ColumnTransformer(
        [
            ("num", StandardScaler(), NUM_FEATS),
            ("cat", OneHotEncoder(handle_unknown="ignore", drop="first"), CAT_FEATS),
        ],
        remainder="passthrough",
    )

    model = RandomForestRegressor(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
    pipe = Pipeline([("pre", preprocess), ("reg", model)])
    pipe.fit(X_train, y_train)

    yp = pipe.predict(X_test)
    y_true_vnd, y_pred_vnd = np.expm1(y_test), np.expm1(yp)
    print("R2 (log):", round(r2_score(y_test, yp), 4))
    print("MAE (log):", round(mean_absolute_error(y_test, yp), 4))
    print("MAE (trieu VND):", round(mean_absolute_error(y_true_vnd, y_pred_vnd), 1))

    joblib.dump(pipe, "model/model.pkl")
    print("Đã lưu model tại model/model.pkl")
    print("Đã lưu danh sách city tại model/city_list.json")

if __name__ == "__main__":
    main()
