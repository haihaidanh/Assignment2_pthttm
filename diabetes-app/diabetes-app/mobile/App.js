import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import NumberField from "./components/NumberField";
import ChipSelect from "./components/ChipSelect";
import ResultCard from "./components/ResultCard";
import { API_URL } from "./config";

const GENDER_OPTIONS = [
  { label: "Nữ", value: "Female" },
  { label: "Nam", value: "Male" },
];
const YES_NO_OPTIONS = [
  { label: "Không", value: 0 },
  { label: "Có", value: 1 },
];
const SMOKING_OPTIONS = [
  { label: "Chưa từng hút", value: "never" },
  { label: "Đang hút", value: "current" },
  { label: "Đã bỏ", value: "former" },
  { label: "Không hiện tại", value: "not current" },
  { label: "Từng hút", value: "ever" },
  { label: "Không rõ", value: "No Info" },
];

export default function App() {
  const [gender, setGender] = useState("Female");
  const [age, setAge] = useState("45");
  const [hypertension, setHypertension] = useState(0);
  const [heartDisease, setHeartDisease] = useState(0);
  const [smoking, setSmoking] = useState("never");
  const [bmi, setBmi] = useState("27.3");
  const [hba1c, setHba1c] = useState("6.0");
  const [glucose, setGlucose] = useState("140");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handlePredict() {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      gender,
      age: Number(age),
      hypertension,
      heart_disease: heartDisease,
      smoking_history: smoking,
      bmi: Number(bmi),
      hbA1c_level: Number(hba1c),
      blood_glucose_level: Number(glucose),
    };

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.detail || `Lỗi API (mã ${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        `Không thể kết nối tới API: ${err.message}. Kiểm tra backend đang chạy tại ${API_URL}.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🩺 Dự đoán nguy cơ tiểu đường</Text>
        <Text style={styles.headerSubtitle}>
          Nhập chỉ số lâm sàng để nhận đánh giá từ mô hình Random Forest
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <ChipSelect label="Giới tính" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
            <NumberField label="Tuổi" value={age} onChange={setAge} placeholder="45" />
            <ChipSelect
              label="Tăng huyết áp"
              options={YES_NO_OPTIONS}
              value={hypertension}
              onChange={setHypertension}
            />
            <ChipSelect
              label="Bệnh tim"
              options={YES_NO_OPTIONS}
              value={heartDisease}
              onChange={setHeartDisease}
            />
            <ChipSelect
              label="Tình trạng hút thuốc"
              options={SMOKING_OPTIONS}
              value={smoking}
              onChange={setSmoking}
            />
            <NumberField label="BMI" value={bmi} onChange={setBmi} placeholder="27.3" />
            <NumberField label="HbA1c (%)" value={hba1c} onChange={setHba1c} placeholder="6.0" />
            <NumberField
              label="Đường huyết (mg/dL)"
              value={glucose}
              onChange={setGlucose}
              placeholder="140"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Dự đoán</Text>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <ResultCard result={result} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1f3a5f" },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700", textAlign: "center" },
  headerSubtitle: {
    color: "#dbe4f0",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  content: { backgroundColor: "#f4f6f9", padding: 20, paddingBottom: 40, flexGrow: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#3b6ea5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorBox: {
    marginTop: 16,
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 14,
  },
  errorText: { color: "#7a2119", fontSize: 13 },
});
