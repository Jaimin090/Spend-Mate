import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { TransactionItem } from "../components/TransactionItem";

const CategoryStatisticsScreen = ({ route }) => {
  const { category } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const now = new Date();
    const filtered = transactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      if (
        isNaN(txnDate.getTime()) ||
        isNaN(parseFloat(txn.amount)) ||
        txn.category !== category
      ) {
        return false;
      }

      if (selectedPeriod === "Month") {
        return (
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear()
        );
      } else if (selectedPeriod === "Year") {
        return txnDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    setFilteredTransactions(filtered);
  }, [transactions, selectedPeriod, category]);

  const chartData = {
    labels: filteredTransactions.map((txn) =>
      new Date(txn.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        data: filteredTransactions.map((txn) => parseFloat(txn.amount)),
        color: (opacity = 1) => `rgba(60, 143, 124, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

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
        <View style={styles.categoryTitleContainer}>
          <Text style={styles.categoryTitle}>{category} Statistics</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["Month", "Year"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          {filteredTransactions.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={250}
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(60, 143, 124, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "5", strokeWidth: "2", stroke: "#4CAF50" },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <Text style={styles.noDataText}>
              No transactions available for this period
            </Text>
          )}
        </View>

        {/* Transactions List */}
        <View style={styles.transactionListHeader}>
          <Text style={styles.transactionListTitle}>
            Transactions in {category}
          </Text>
        </View>
        <View style={styles.transactionList}>
          {filteredTransactions.map((txn) => (
            <TransactionItem
              key={txn.id}
              name={txn.name}
              date={new Date(txn.date).toLocaleDateString()}
              icon={txn.icon}
              amount={`${txn.type === "income" ? "+" : "-"} $${txn.amount}`}
            />
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
  categoryTitleContainer: {
    marginTop: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3C8F7C",
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 5,
  },
  selectedPeriodButton: {
    backgroundColor: "#3C8F7C",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#666",
  },
  selectedPeriodButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  transactionListHeader: {
    marginTop: 20,
  },
  transactionListTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  transactionList: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CategoryStatisticsScreen;
