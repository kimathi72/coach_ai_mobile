import { useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";

/**
 * Message shape coming from Rails API
 */
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatScreen() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = async (): Promise<void> => {
    const response = await fetch("https://83d1f1023a50.ngrok-free.app/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data: { messages: ChatMessage[] } = await response.json();
    setMessages(data.messages);
    setMessage("");
  };

  return (
    <View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: ChatMessage }) => (
          <Text>
            {item.role}: {item.content}
          </Text>
        )}
      />

      <TextInput
        placeholder="Type a message"
        value={message}
        onChangeText={setMessage}
      />

      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
