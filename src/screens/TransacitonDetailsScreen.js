import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, update, remove } from "firebase/database";
import DateTimePicker from "@react-native-community/datetimepicker";

const TransactionDetailsScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const [name, setName] = useState(transaction.name);
  const [amount, setAmount] = useState(transaction.amount);
  const [date, setDate] = useState(new Date(transaction.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState(transaction.category);

  const userId = auth.currentUser?.uid;

  const handleEdit = async () => {
    if (!name || !amount || !category) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const transactionRef = ref(
        db,
        `transactions/${userId}/${transaction.id}`
      );
      await update(transactionRef, {
        name,
        amount: parseFloat(amount).toFixed(2),
        date: date.toISOString(),
        category,
      });
      Alert.alert("Success", "Transaction updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating transaction:", error);
      Alert.alert("Error", "Failed to update the transaction.");
    }
  };

  const handleDelete = async () => {
    try {
      const transactionRef = ref(
        db,
        `transactions/${userId}/${transaction.id}`
      );
      await remove(transactionRef);
      Alert.alert("Success", "Transaction deleted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      Alert.alert("Error", "Failed to delete the transaction.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transaction Details</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
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

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 24,
    fontWeight: "bold",
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#F95B51",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TransactionDetailsScreen;
