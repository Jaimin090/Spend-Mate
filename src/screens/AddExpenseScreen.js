import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, push } from "firebase/database";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker"; // Dropdown menu

const AddExpenseScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // Default to 'expense'
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(""); // Selected category
  const [icon, setIcon] = useState(""); // Selected icon
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Category data with icons
  const categories = [
    { label: "Grocery", icon: require("../assets/icons/food.png") },
    { label: "Dining", icon: require("../assets/icons/spoon-and-fork.png") },
    { label: "Travel", icon: require("../assets/icons/car-speed.png") },
    { label: "Job", icon: require("../assets/icons/suitcase.png") },
    { label: "Misc", icon: require("../assets/icons/calculate.png") },
  ];

  // Handle adding the transaction
  const handleAddExpense = async () => {
    if (!name || !amount || !category) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid; // Ensure the transaction is stored under the logged-in user
      if (!userId) throw new Error("User not authenticated");

      const transactionRef = ref(db, `transactions/${userId}`);
      const newTransaction = {
        name,
        amount: parsedAmount.toFixed(2),
        type, // 'expense' or 'income'
        category,
        icon, // Icon for the selected category
        date: date.toISOString(),
      };

      await push(transactionRef, newTransaction);

      Alert.alert("Success", `${type === "income" ? "Income" : "Expense"} added!`);
      navigation.goBack(); // Return to the previous screen (e.g., Dashboard)
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "An error occurred while adding the transaction.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add {type === "income" ? "Income" : "Expense"}</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name (e.g., Coffee, Salary)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g., 100)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Category Dropdown */}
        <Picker
          selectedValue={category}
          onValueChange={(itemValue, itemIndex) => {
            setCategory(itemValue);
            setIcon(categories[itemIndex - 1]?.icon); // Set the icon for the selected category
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat.label} value={cat.label} />
          ))}
        </Picker>

        {/* Date Picker */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {`Date: ${date.toLocaleDateString()}`}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </View>

      {/* Expense/Income Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, type === "expense" && styles.selectedButton]}
          onPress={() => setType("expense")}
        >
          <Text style={[styles.toggleText, type === "expense" && styles.selectedText]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, type === "income" && styles.selectedButton]}
          onPress={() => setType("income")}
        >
          <Text style={[styles.toggleText, type === "income" && styles.selectedText]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
        <Text style={styles.buttonText}>Add {type === "income" ? "Income" : "Expense"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#3C8F7C",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    fontSize: 16,
  },
  picker: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateButton: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#3C8F7C",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  selectedButton: {
    backgroundColor: "#3C8F7C",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#3C8F7C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddExpenseScreen;
