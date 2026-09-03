"""
Huấn luyện mô hình Random Forest dự đoán tiểu đường và lưu thành model.pkl
(bao gồm cả bước tiền xử lý - preprocessing pipeline - trong cùng 1 file pickle)
"""
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

DATA_PATH = "diabetes_dataset.csv"  # đặt file csv gốc cùng thư mục này khi huấn luyện

NUM_FEATS = ["age", "bmi", "hbA1c_level", "blood_glucose_level"]
BIN_FEATS = ["hypertension", "heart_disease"]
CAT_FEATS = ["gender", "smoking_history"]
ALL_FEATS = NUM_FEATS + BIN_FEATS + CAT_FEATS
TARGET = "diabetes"

def main():
    df = pd.read_csv(DATA_PATH)
    df = df.drop_duplicates()
    df = df[df["gender"] != "Other"]

    X = df[ALL_FEATS]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    preprocess = ColumnTransformer(
        [
            ("num", StandardScaler(), NUM_FEATS),
            ("cat", OneHotEncoder(handle_unknown="ignore", drop="first"), CAT_FEATS),
        ],
        remainder="passthrough",  # giữ nguyên các cột binary
    )

    model = RandomForestClassifier(
        n_estimators=200, max_depth=12, class_weight="balanced", random_state=42, n_jobs=-1
    )

    pipe = Pipeline([("pre", preprocess), ("clf", model)])
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    print(classification_report(y_test, y_pred, digits=4))

    joblib.dump(pipe, "model/model.pkl")
    print("Đã lưu model tại model/model.pkl")

if __name__ == "__main__":
    main()
