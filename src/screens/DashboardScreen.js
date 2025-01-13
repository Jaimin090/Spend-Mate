import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionItem } from "../components/TransactionItem";
import { useNavigation } from "@react-navigation/native";

const DashboardScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    // Fetch User's Name
    const userRef = ref(db, `users/${userId}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setUserName(`${userData.firstName} ${userData.lastName}`);
      }
    });

    // Fetch Transactions
    const transactionsRef = ref(db, `transactions/${userId}`);
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const transactionsArray = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setTransactions(transactionsArray);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 12) {
      setGreeting("Good morning,");
    } else if (currentHour < 18) {
      setGreeting("Good afternoon,");
    } else {
      setGreeting("Good evening,");
    }
  }, []);

  // Calculate balances
  const savings = transactions
    .filter((txn) => txn.type === "income")
    .reduce((acc, txn) => acc + parseFloat(txn.amount), 0);
  const expenses = transactions
    .filter((txn) => txn.type === "expense")
    .reduce((acc, txn) => acc + parseFloat(txn.amount), 0);

  const totalIncome = savings - expenses;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796B" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.incomeLabel}>Total Income</Text>
          <Text style={styles.incomeValue}>${totalIncome.toFixed(2)}</Text>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Overview", { filter: "income" })
            }
          >
            <BalanceCard
              type="Savings"
              amount={`$${savings.toFixed(2)}`}
              customIcon={require("../assets/icons/green-arrow-up.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Overview", { filter: "expense" })
            }
          >
            <BalanceCard
              type="Expenses"
              amount={`$${expenses.toFixed(2)}`}
              customIcon={require("../assets/icons/red-arrow-down.png")}
            />
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>Transactions History</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionList}>
          {transactions.map((txn) => (
            <TouchableOpacity
              key={txn.id}
              onPress={() =>
                navigation.navigate("TransactionDetails", {
                  transaction: txn, // Pass the transaction data
                })
              }
              style={styles.transactionItemWrapper} // Add wrapper style for better spacing
            >
              <TransactionItem
                name={`${txn.name} (${txn.category})`}
                date={new Date(txn.date).toLocaleDateString()}
                icon={txn.icon}
                amount={`${txn.type === "income" ? "+" : "-"} $${txn.amount}`}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: "#3C8F7C",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4, // Add shadow for better depth
  },
  greeting: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
  },
  name: {
    fontSize: 24, // Increased font size
    fontWeight: "600",
    color: "#fff",
  },
  incomeLabel: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
  },
  incomeValue: {
    fontSize: 32, // Increased font size for emphasis
    fontWeight: "700", // Bolder font
    color: "#fff",
    marginTop: 5,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -30, // Reduce overlap margin
    paddingHorizontal: 10,
    paddingBottom: 10, // Added spacing
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10, // Improved spacing
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: "700", // Increased font weight
    color: "#222",
  },
  seeAll: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600", // Added boldness
  },
  transactionList: {
    marginTop: 10,
  },
  transactionItemWrapper: {
    marginBottom: 15, // Add spacing between items
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardScreen;
