// components/MessageBubble.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TypingIndicator from "./TypingIndicator";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {content === "" && !isUser ? (
          <TypingIndicator />
        ) : (
          <Text
            style={[
              styles.text,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {content}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },

  userContainer: {
    alignItems: "flex-end",
  },

  assistantContainer: {
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#DCF8C6", // WhatsApp green
    borderBottomRightRadius: 4,
  },

  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },

  text: {
    fontSize: 16,
    lineHeight: 22,
  },

  userText: {
    color: "#000",
  },

  assistantText: {
    color: "#000",
  },
});
