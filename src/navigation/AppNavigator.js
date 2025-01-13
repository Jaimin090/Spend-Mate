import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import DashboardScreen from "../screens/DashboardScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import OverviewScreen from "../screens/OverviewScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen";
import TransactionDetailsScreen from "../screens/TransacitonDetailsScreen";
import CategoryStatisticsScreen from "../screens/CategoryStatisticsScreen";
import AccountInfoScreen from "../screens/AccountInforScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import BackButton from "../components/BackButton";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Add Button Component
const AddButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.addButton}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
);

// Reusable Header Options
const defaultHeaderOptions = (navigation, title) => ({
  title,
  headerLeft: () => <BackButton navigation={navigation} />, // Add BackButton
  headerStyle: {
    backgroundColor: "#3C8F7C", // Consistent green header color
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerTintColor: "#fff", // White text/icons
});

// Tab Navigator (Main App)
const TabNavigator = ({ navigation }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false, // Disable default tab headers
      tabBarStyle: styles.tabBar, // Custom tabBar styling
      tabBarShowLabel: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case "Dashboard":
            iconName = "home";
            break;
          case "Statistics":
            iconName = "stats-chart";
            break;
          case "Overview":
            iconName = "wallet";
            break;
          case "Profile":
            iconName = "person";
            break;
          default:
            break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#4CAF50",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Statistics" component={StatisticsScreen} />
    <Tab.Screen
      name="AddExpense"
      component={AddExpenseScreen} // Directly navigate to AddExpenseScreen
      options={{
        tabBarButton: () => (
          <AddButton onPress={() => navigation.navigate("AddExpense")} />
        ),
      }}
    />
    <Tab.Screen name="Overview" component={OverviewScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Stack Navigator for Authenticated Users
const AppStack = () => (
  <Stack.Navigator>
    {/* Main Tab Navigator */}
    <Stack.Screen
      name="Main"
      component={TabNavigator}
      options={{ headerShown: false }}
    />

    {/* Add Expense */}
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={({ navigation }) => defaultHeaderOptions(navigation, "Add Expense")}
    />

    {/* Transaction History */}
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={({ navigation }) =>
        defaultHeaderOptions(navigation, "Transaction History")
      }
    />

    {/* Transaction Details */}
    <Stack.Screen
      name="TransactionDetails"
      component={TransactionDetailsScreen}
      options={({ navigation }) =>
        defaultHeaderOptions(navigation, "Transaction Details")
      }
    />

    {/* Category Statistics */}
    <Stack.Screen
      name="CategoryStatistics"
      component={CategoryStatisticsScreen}
      options={({ navigation }) =>
        defaultHeaderOptions(navigation, "Category Statistics")
      }
    />

    {/* Account Info */}
    <Stack.Screen
      name="AccountInfo"
      component={AccountInfoScreen}
      options={({ navigation }) =>
        defaultHeaderOptions(navigation, "Account Info")
      }
    />
  </Stack.Navigator>
);

// Main Navigator with Auth Flow
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return user ? <AppStack /> : <LoginScreen />;
};

// Styles
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    height: 70,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});

export default AppNavigator;
