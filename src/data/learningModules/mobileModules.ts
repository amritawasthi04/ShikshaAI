import { DetailedLessonModule } from "./types";

export const mobileModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: React Native Yoga Layout Engine
  "react_native_yoga_engine": {
    topicId: "mob_1_1",
    title: "React Native Yoga Layout Engine",
    subtitle: "Adaptive Flexbox for different device screen aspect ratios, SafeAreas, and Pixel Ratio.",
    domain: "Mobile App Development",
    phaseName: "Foundation",
    duration: "35m",
    type: "concept",
    keyObjectives: [
      "Understand Yoga C++ layout engine cross-compiling Flexbox styles to Android and iOS views.",
      "Handle notch, status bar, and home-indicator cutouts with SafeAreaProvider and safe area insets.",
      "Scale typography and touch targets across pixel densities using PixelRatio and dp units.",
      "Implement responsive layout breakpoints using useWindowDimensions.",
    ],
    deepDive: {
      overview:
        "React Native relies on Meta's Yoga engine—a high-performance C++ implementation of W3C Flexbox. Unlike web CSS where flex-direction defaults to row, Yoga in React Native defaults flex-direction to column, reflecting vertical mobile screen ergonomics.",
      mentalModel:
        "Think of Yoga as a universal translator. When you declare flex: 1 and justifyContent: 'center', Yoga calculates the exact physical pixel positions on an iPhone Retina display or a 120Hz Samsung OLED panel, converting logical density-independent pixels (dp) directly into native UI coordinate frames.",
      coreConcepts: [
        {
          title: "Safe Area Insets",
          description:
            "Mobile screens contain physical intrusions: sensor notches, dynamic islands, pill cutouts, and bottom gesture bars. Wrapping screens in useSafeAreaInsets provides padding values so buttons never overlap native OS gesture zones.",
          highlight: "Never hardcode top padding to 20 or 44; dynamic devices have variable safe area geometries.",
        },
      ],
      pitfalls: [
        "Setting flex-direction: row and wondering why items stack horizontally instead of vertically without recognizing React Native defaults.",
      ],
      realWorldApplications:
        "Cross-platform apps like Shopify, Discord, Instagram, and Coinbase running smoothly on iOS and Android.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript • React Native",
      filename: "components/ResponsiveScreen.tsx",
      code: `import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ResponsiveHeader: React.FC<{ title: string }> = ({ title }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingHorizontal: isTablet ? 32 : 16 }]}>
      <Text style={[styles.title, isTablet && styles.tabletTitle]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6F1E9",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D8C8BA",
    paddingBottom: 12,
  },
  title: {
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "700",
    color: "#292827",
  },
  tabletTitle: {
    fontSize: 28,
  },
});`,
      explanation: "Adaptive React Native header component integrating safe area insets and responsive window dimensions.",
    },
    quizQuestions: [
      {
        question: "What is the default flexDirection in React Native Yoga engine?",
        options: [
          "column (vertical stacking by default)",
          "row (horizontal by default like web CSS)",
          "grid",
          "relative",
        ],
        correctIndex: 0,
        explanation:
          "React Native defaults flexDirection to column to prioritize standard vertical mobile scrolling layouts.",
      },
    ],
    resources: [
      {
        title: "React Native Documentation: Layout with Flexbox",
        url: "https://reactnative.dev/docs/flexbox",
        type: "documentation",
        description: "Official guide to Flexbox, Yoga engine, and layout props.",
      },
    ],
  },
};
