import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function NumberField({ label, value, onChange, placeholder }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9aa2ad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d7dce3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fafbfc",
    color: "#202632",
  },
});
