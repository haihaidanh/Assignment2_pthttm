import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";

import NumberField from "./components/NumberField";
import ChipSelect from "./components/ChipSelect";
import { API_URL } from "./config";

const FRONTAGE_OPTIONS = [
  { label: "Có mặt tiền", value: 1 },
  { label: "Không mặt tiền", value: 0 },
];

function formatPrice(million) {
  if (million >= 1000) return `${(million / 1000).toFixed(2)} tỷ VND`;
  return `${Math.round(million)} triệu VND`;
}

export default function App() {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("60");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");
  const [floors, setFloors] = useState("3");
  const [frontage, setFrontage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/cities`);
        const data = await res.json();
        setCities(data.cities || []);
        if (data.cities?.length) setCity(data.cities[0]);
      } catch {
        setCities(["Hồ Chí Minh", "Hà Nội"]);
        setCity("Hồ Chí Minh");
      } finally {
        setLoadingCities(false);
      }
    })();
  }, []);

  async function handlePredict() {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      area_m2: Number(area),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      floors: Number(floors),
      frontage,
      city,
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
        <Text style={styles.headerTitle}>🏠 Định giá bất động sản</Text>
        <Text style={styles.headerSubtitle}>
          Nhập đặc điểm căn nhà để nhận giá ước tính từ mô hình Random Forest
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            {loadingCities ? (
              <ActivityIndicator style={{ marginBottom: 16 }} />
            ) : (
              <View style={styles.pickerWrap}>
                <Picker selectedValue={city} onValueChange={setCity}>
                  {cities.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                  <Picker.Item label="Khác (không có trong danh sách)" value="Khác" />
                </Picker>
              </View>
            )}

            <NumberField label="Diện tích (m²)" value={area} onChange={setArea} placeholder="60" />
            <NumberField label="Số phòng ngủ" value={bedrooms} onChange={setBedrooms} placeholder="3" />
            <NumberField label="Số phòng tắm" value={bathrooms} onChange={setBathrooms} placeholder="2" />
            <NumberField label="Số tầng" value={floors} onChange={setFloors} placeholder="3" />
            <ChipSelect
              label="Mặt tiền"
              options={FRONTAGE_OPTIONS}
              value={frontage}
              onChange={setFrontage}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Định giá</Text>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.priceLabel}>GIÁ ƯỚC TÍNH</Text>
              <Text style={styles.price}>{result.predicted_price_display}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  ~ {result.price_per_m2_million_vnd.toLocaleString("vi-VN")} triệu VND / m²
                </Text>
              </View>
            </View>
          )}
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
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 6 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#d7dce3",
    borderRadius: 8,
    backgroundColor: "#fafbfc",
    marginBottom: 16,
    overflow: "hidden",
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
  resultCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  priceLabel: { fontSize: 12, fontWeight: "700", color: "#6b7280", letterSpacing: 1 },
  price: { fontSize: 30, fontWeight: "800", color: "#1f3a5f", marginTop: 4, marginBottom: 10 },
  badge: {
    backgroundColor: "#eaf0f7",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: { color: "#3b6ea5", fontSize: 13, fontWeight: "600" },
});
