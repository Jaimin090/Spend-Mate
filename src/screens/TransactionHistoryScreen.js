import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { TransactionItem } from "../components/TransactionItem";

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'income', 'expense'
  const [period, setPeriod] = useState("all"); // 'week', 'month', 'year', 'all'

  // Fetch transactions from Firebase
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const transactionsRef = ref(db, `transactions/${userId}`);
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const transactionsArray = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      setTransactions(transactionsArray);
    });

    return () => unsubscribe();
  }, []);

  // Filter transactions by type
  const filteredTransactions = transactions.filter((txn) => {
    const now = new Date();
    const txnDate = new Date(txn.date);

    // Filter by type
    if (filter !== "all" && txn.type !== filter) {
      return false;
    }

    // Filter by period
    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return txnDate >= oneWeekAgo && txnDate <= now;
    } else if (period === "month") {
      return (
        txnDate.getMonth() === now.getMonth() &&
        txnDate.getFullYear() === now.getFullYear()
      );
    } else if (period === "year") {
      return txnDate.getFullYear() === now.getFullYear();
    }

    return true; // Default to include all
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        {/* Type Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterTitle}>Type</Text>
          <View style={styles.filterOptions}>
            {["all", "income", "expense"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filter === type && styles.selectedFilterButton,
                ]}
                onPress={() => setFilter(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === type && styles.selectedFilterButtonText,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterTitle}>Period</Text>
          <View style={styles.filterOptions}>
            {["all", "week", "month", "year"].map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.filterButton,
                  period === timeframe && styles.selectedFilterButton,
                ]}
                onPress={() => setPeriod(timeframe)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    period === timeframe && styles.selectedFilterButtonText,
                  ]}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView contentContainerStyle={styles.transactionsContainer}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((txn) => (
            <TransactionItem
              key={txn.id}
              name={`${txn.name} (${txn.category})`}
              date={new Date(txn.date).toLocaleDateString()}
              icon={txn.icon}
              amount={`${txn.type === "income" ? "+" : "-"} $${txn.amount}`}
            />
          ))
        ) : (
          <Text style={styles.noTransactionsText}>
            No transactions to display.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filters: {
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterButton: {
    backgroundColor: "#3C8F7C",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  selectedFilterButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noTransactionsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default TransactionHistoryScreen;
