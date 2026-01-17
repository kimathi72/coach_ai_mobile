import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Button,
    FlatList,
    InputAccessoryView,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const API_BASE_URL = "https://83d1f1023a50.ngrok-free.app";

// Extra offset for predictive bar / safe area
const EXTRA_KEYBOARD_OFFSET = Platform.OS === "ios" ? 48 : 32;

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

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

  /* ------------------ Send message ------------------ */
  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data: { messages: ChatMessage[] } = await res.json();
      setMessages(data.messages);
      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <View style={styles.container}>
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.messageText}>
            {item.role}: {item.content}
          </Text>
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
                {
                  translateY: Animated.multiply(keyboardHeight, -1),
                },
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
          />
          <Button
            title={loading ? "Sending..." : "Send"}
            onPress={sendMessage}
            disabled={loading}
          />
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
            />
            <Button
              title={loading ? "Sending..." : "Send"}
              onPress={sendMessage}
              disabled={loading}
            />
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
  messageText: {
    marginBottom: 8,
    fontSize: 16,
  },
});
