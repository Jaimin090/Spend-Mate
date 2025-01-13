import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BackButton = ({ navigation }) => (
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()} // Navigate back to the previous screen
  >
    <Ionicons name="chevron-back" size={24} color="white" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
  },
});

export default BackButton;
