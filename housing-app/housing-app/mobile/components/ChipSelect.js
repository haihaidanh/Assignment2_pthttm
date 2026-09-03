import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ChipSelect({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7dce3",
    backgroundColor: "#fafbfc",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#3b6ea5",
    borderColor: "#3b6ea5",
  },
  chipText: { fontSize: 13, color: "#202632" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
});
