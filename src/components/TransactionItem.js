import React from "react";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";

export const TransactionItem = ({ name, date, icon, amount }) => {
  const isIncome = amount.includes("+");

  return (
    <Pressable
      style={({ pressed }) => [
        styles.transactionContainer,
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${name} for ${amount} on ${date}`}
    >
      <View style={styles.transactionInfo}>
        <View style={styles.iconContainer}>
          {/* Handle local icons via `require` */}
          <Image
            resizeMode="contain"
            source={icon}
            style={styles.transactionIcon}
            accessible={true}
            accessibilityLabel={`${name} icon`}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionName}>{name}</Text>
          <Text style={styles.transactionDate}>{date}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          isIncome ? styles.incomeText : styles.expenseText,
        ]}
      >
        {amount}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  transactionIcon: {
    width: 34,
    height: 34,
  },
  transactionDetails: {
    justifyContent: "center",
    marginLeft: 10,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  incomeText: {
    color: "#25A969",
  },
  expenseText: {
    color: "#F95B51",
  },
});

export default TransactionItem;
