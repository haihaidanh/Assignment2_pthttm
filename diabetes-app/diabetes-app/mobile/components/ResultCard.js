import React from "react";
import { View, Text, StyleSheet } from "react-native";

const RISK_COLORS = {
  "Thấp": "#2f9e5c",
  "Trung bình": "#d9a441",
  "Cao": "#c0504d",
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const pct = Math.round(result.probability * 100);
  const color = RISK_COLORS[result.risk_level] || "#3b6ea5";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{result.label}</Text>
      <Text style={styles.prob}>
        Xác suất mô hình dự đoán: <Text style={styles.bold}>{pct}%</Text>
      </Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>Mức nguy cơ: {result.risk_level}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#202632", marginBottom: 4 },
  prob: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  bold: { fontWeight: "700", color: "#202632" },
  badge: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  barBg: { marginTop: 12, height: 10, borderRadius: 6, backgroundColor: "#eceff3", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 6 },
});
