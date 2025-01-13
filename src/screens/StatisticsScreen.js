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
import BackButton from "../components/BackButton"; // Import BackButton

const StatisticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorySpending, setCategorySpending] = useState([]);

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
    const aggregatedSpending = {};

    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date);
      if (
        (selectedPeriod === "Month" &&
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear()) ||
        (selectedPeriod === "Year" && txnDate.getFullYear() === now.getFullYear())
      ) {
        if (txn.type === "expense") {
          const category = txn.category || "Misc";
          aggregatedSpending[category] =
            (aggregatedSpending[category] || 0) + parseFloat(txn.amount);
        }
      }
    });

    const sortedCategories = Object.entries(aggregatedSpending)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    setCategorySpending(sortedCategories);
  }, [transactions, selectedPeriod]);

  const chartData = {
    labels: transactions.map((txn) =>
      new Date(txn.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        data: transactions
          .map((txn) =>
            txn.type === "income"
              ? parseFloat(txn.amount)
              : -parseFloat(txn.amount)
          )
          .filter((value) => !isNaN(value)),
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
        {/* Header */}
        <View style={styles.header}>
          <BackButton navigation={navigation} />
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>

        {/* Time Period Selector */}
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
          {transactions.length > 0 ? (
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
            <Text>No transactions available for this period</Text>
          )}
        </View>

        {/* Top Spending Categories */}
        <View style={styles.topSpendingHeader}>
          <Text style={styles.topSpendingTitle}>Top Spending Categories</Text>
        </View>
        <View style={styles.categoryList}>
          {categorySpending.map((item) => (
            <TouchableOpacity
              key={item.category}
              onPress={() =>
                navigation.navigate("CategoryStatistics", {
                  category: item.category,
                })
              }
              style={styles.categoryButton}
            >
              <Text style={styles.categoryButtonText}>{item.category}</Text>
              <Text style={styles.categoryAmount}>
                ${item.total.toFixed(2)}
              </Text>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C8F7C",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    paddingRight: 30, // Ensures proper centering with BackButton
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
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
  topSpendingHeader: {
    marginTop: 20,
  },
  topSpendingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoryList: {
    marginTop: 10,
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F95B51",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StatisticsScreen;
