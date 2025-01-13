import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { ref, update } from "firebase/database";

const AccountInfoScreen = ({ route, navigation }) => {
  const { profile } = route.params; // Get the profile data passed from ProfileScreen
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [email, setEmail] = useState(profile.email || "");
  const [profileImage, setProfileImage] = useState(profile.profileImage || "");
  const [loading, setLoading] = useState(false);

  const userId = auth.currentUser?.uid;

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        firstName,
        lastName,
        email,
        profileImage,
      });

      setLoading(false);
      Alert.alert("Success", "Account information updated successfully!");
      navigation.goBack(); // Return to the ProfileScreen
    } catch (error) {
      setLoading(false);
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update your account information.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      

      {/* Profile Image Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              profileImage ||
              "https://cdn.builder.io/api/v1/image/assets/TEMP/f3d013b173f8c1e73399e71c5a34b636",
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={() =>
            Alert.alert("Change Profile Picture", "Feature coming soon!")
          }
        >
          <Text style={styles.changeImageText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
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
  changeImageButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  changeImageText: {
    color: "#3C8F7C",
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AccountInfoScreen;
