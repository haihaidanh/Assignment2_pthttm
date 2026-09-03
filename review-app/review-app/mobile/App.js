import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import ResultCard from "./components/ResultCard";
import { API_URL } from "./config";

const EXAMPLES = [
  {
    label: "Tích cực",
    text: "This dress fits perfectly and the fabric feels amazing. Highly recommend!",
  },
  {
    label: "Tiêu cực",
    text: "Terrible quality, fabric is cheap and it fell apart after one wash. Very disappointed.",
  },
  {
    label: "Trung lập",
    text: "It was okay, nothing special, sizing was a bit off.",
  },
];

export default function App() {
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handlePredict() {
    if (!reviewText.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, review_text: reviewText }),
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
        <Text style={styles.headerTitle}>👗 Dự đoán khách hàng có Recommend không?</Text>
        <Text style={styles.headerSubtitle}>
          Nhập nội dung đánh giá sản phẩm để mô hình phân tích
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Tiêu đề đánh giá (không bắt buộc)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: Love it! / Disappointed..."
              placeholderTextColor="#9aa2ad"
            />

            <Text style={styles.label}>Nội dung đánh giá</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Nhập nội dung đánh giá sản phẩm (tiếng Anh)..."
              placeholderTextColor="#9aa2ad"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Phân tích</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.examplesRow}>
            {EXAMPLES.map((ex) => (
              <TouchableOpacity
                key={ex.label}
                style={styles.exampleBtn}
                onPress={() => {
                  setReviewText(ex.text);
                  setTitle("");
                }}
              >
                <Text style={styles.exampleBtnText}>{ex.label}</Text>
              </TouchableOpacity>
            ))}
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
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center" },
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
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d7dce3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fafbfc",
    color: "#202632",
    marginBottom: 12,
  },
  textarea: { height: 120 },
  button: {
    marginTop: 4,
    backgroundColor: "#3b6ea5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  examplesRow: { flexDirection: "row", justifyContent: "center", marginTop: 14, flexWrap: "wrap" },
  exampleBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d7dce3",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
  },
  exampleBtnText: { color: "#3b6ea5", fontSize: 12, fontWeight: "600" },
  errorBox: {
    marginTop: 16,
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 14,
  },
  errorText: { color: "#7a2119", fontSize: 13 },
});
