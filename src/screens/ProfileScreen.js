import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // To detect when screen regains focus
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { ref, get } from "firebase/database";

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await get(ref(db, `users/${userId}`));
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Unable to fetch profile details. Please try again.");
    }
  };

  // UseFocusEffect to refetch profile when navigating back to this screen
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditAccount = () => {
    navigation.navigate("AccountInfo", { profile }); // Pass current profile to AccountInfo screen
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              profile?.profileImage ||
              "https://cdn.builder.io/api/v1/image/assets/TEMP/f3d013b173f8c1e73399e71c5a34b636",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={handleEditAccount}>
          <Text style={styles.optionText}>Edit Account Info</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#3C8F7C",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4, // Add shadow for depth
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#3C8F7C",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  optionsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
