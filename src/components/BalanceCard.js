import React from "react";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";

export const BalanceCard = ({ type, amount, customIcon }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.balanceContainer,
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${type} balance ${amount}`}
    >
      <View style={styles.balanceHeader}>
        <View style={styles.iconWrapper}>
          <Image
            resizeMode="contain"
            source={customIcon}
            style={styles.balanceIcon}
            accessible={true}
            accessibilityLabel={`${type} icon`}
          />
        </View>
        <Text style={styles.balanceLabel}>{type}</Text>
      </View>
      <Text style={styles.amountText}>{amount}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceIcon: {
    width: 18,
    height: 18,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 1)",
    letterSpacing: -0.8,
  },
  amountText: {
    fontSize: 20,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 1)",
    letterSpacing: -1,
    marginTop: 8,
  },
});
