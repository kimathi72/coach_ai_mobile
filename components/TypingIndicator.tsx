// components/TypingIndicator.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((a) => a.start());

    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.container}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginLeft: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#999",
    marginHorizontal: 3,
  },
});
