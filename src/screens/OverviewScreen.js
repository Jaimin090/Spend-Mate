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
import { BarChart } from "react-native-chart-kit";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";
import BackButton from "../components/BackButton"; // Assuming you have a BackButton component

const OverviewScreen = ({ route, navigation }) => {
  const { filter } = route.params || {};
  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const [selectedType, setSelectedType] = useState(filter || "all");
  const [transactions, setTransactions] = useState([]);
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

  const filteredTransactions = transactions.filter((txn) => {
    const transactionDate = new Date(txn.date);
    const now = new Date();

    if (selectedType !== "all" && txn.type !== selectedType) {
      return false;
    }

    if (selectedPeriod === "Week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return transactionDate >= oneWeekAgo && transactionDate <= now;
    } else if (selectedPeriod === "Month") {
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  const barChartData = {
    labels: filteredTransactions.map((txn) =>
      new Date(txn.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        data: filteredTransactions.map((txn) =>
          txn.type === "income" ? parseFloat(txn.amount) : -parseFloat(txn.amount)
        ),
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
      <View style={styles.header}>
        <BackButton navigation={navigation} />
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          {["all", "income", "expense"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                selectedType === type && styles.selectedTypeButton,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type && styles.selectedTypeButtonText,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["Week", "Month"].map((period) => (
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

        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          <BarChart
            data={barChartData}
            width={Dimensions.get("window").width - 40}
            height={250}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(60, 143, 124, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.barChart}
          />
        </View>

        {/* Transactions List */}
        <Text style={styles.listHeader}>Transactions</Text>
        {filteredTransactions.map((txn) => (
          <View key={txn.id} style={styles.transactionItem}>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{txn.name}</Text>
              <Text style={styles.transactionDate}>
                {new Date(txn.date).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                txn.type === "income" ? styles.incomeText : styles.expenseText,
              ]}
            >
              {txn.type === "income" ? "+" : "-"} ${txn.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3C8F7C",
    padding: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    paddingRight: 30, // To account for BackButton spacing
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  selectedTypeButton: {
    backgroundColor: "#3C8F7C",
  },
  typeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  selectedTypeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
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
    marginVertical: 20,
  },
  barChart: {
    borderRadius: 16,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  transactionDetails: {
    flexDirection: "column",
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  incomeText: {
    color: "#25A969",
  },
  expenseText: {
    color: "#F95B51",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OverviewScreen;
