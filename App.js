import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native"; // Only here
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import SignupScreen from "./src/screens/Auth/SignupScreen";
import AppNavigator from "./src/navigation/AppNavigator"; // AppNavigator imported here

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer> {/* Only one NavigationContainer at the root */}
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? "Main" : "Login"} // Check if user is logged in
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={() => setIsLoggedIn(true)} // Update login state
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Main App Navigator */}
        <Stack.Screen name="Main" component={AppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
