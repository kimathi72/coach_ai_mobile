import { useEffect, useRef, useState } from "react";
import MessageBubble from "../components/MessageBubble";

import {
  Animated,
  Button,
  FlatList,
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "sending" | "sent" | "error";
};

const API_BASE_URL = "https://a6ffb13be771.ngrok-free.app";
const EXTRA_KEYBOARD_OFFSET = Platform.OS === "ios" ? 48 : 32;

// 🧠 Artificial typing delay (frontend only)
const TYPING_DELAY_MS = 400;

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  /* ------------------ Auto-scroll ------------------ */
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  /* ---------------- Keyboard handling -------------- */
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height + EXTRA_KEYBOARD_OFFSET,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    const hideListener = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  /* ------------ Backend send helper (unchanged logic) ------------ */
  const sendMessageToBackend = async (
    content: string,
    userMessageId: string,
    typingId: string,
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data: {
        message: { id: string; role: "assistant"; content: string };
      } = await res.json();

      // Mark user message as sent
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessageId ? { ...m, status: "sent" } : m,
        ),
      );

      // Replace typing indicator with assistant response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, content: data.message.content, status: "sent" }
            : m,
        ),
      );
    } catch (err) {
      console.error("Send message failed:", err);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessageId ? { ...m, status: "error" } : m,
        ),
      );

      setMessages((prev) => prev.filter((m) => m.id !== typingId));
    }
  };

  /* ------------------ Send message ------------------ */
  const sendMessage = () => {
    if (!message.trim()) return;

    const content = message;
    setMessage("");

    const userMessageId = uuidv4();
    const typingId = uuidv4();

    // 1. Optimistic user message + typing placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content,
        status: "sending",
      },
      {
        id: typingId,
        role: "assistant",
        content: "",
        status: "sending",
      },
    ]);

    // 2. Artificial typing delay before hitting backend
    setTimeout(() => {
      sendMessageToBackend(content, userMessageId, typingId);
    }, TYPING_DELAY_MS);
  };

  /* ------------------ UI ------------------ */
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble role={item.role} content={item.content} />
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: 8,
          paddingBottom: Platform.OS === "ios" ? 0 : 90,
        }}
      />

      {/* ANDROID INPUT */}
      {Platform.OS !== "ios" && (
        <Animated.View
          style={[
            styles.inputRow,
            {
              transform: [
                { translateY: Animated.multiply(keyboardHeight, -1) },
              ],
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            onSubmitEditing={sendMessage}
          />
          <Button title="Send" onPress={sendMessage} />
        </Animated.View>
      )}

      {/* IOS INPUT */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="CHAT_INPUT">
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              inputAccessoryViewID="CHAT_INPUT"
              placeholder="Type a message"
              value={message}
              onChangeText={setMessage}
              style={styles.messageInput}
              onSubmitEditing={sendMessage}
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
});
