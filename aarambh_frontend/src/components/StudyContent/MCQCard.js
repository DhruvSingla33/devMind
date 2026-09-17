import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme/theme";

const DIFFICULTY_COLORS = {
  Easy: colors.success,
  Medium: colors.primary,
  Hard: colors.danger
};

const MCQCard = ({ question, questionNumber }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const difficultyColor =
    DIFFICULTY_COLORS[question.difficulty] || colors.muted;

  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{"◉"} MCQ</Text>
        </View>

        <View
          style={[styles.difficultyBadge, { borderColor: difficultyColor }]}
        >
          <Text style={[styles.difficultyText, { color: difficultyColor }]}>
            {question.difficulty}
          </Text>
        </View>

        <Text style={styles.marks}>{question.marks} marks</Text>
      </View>

      <Text style={styles.question}>
        <Text style={styles.questionNumber}>{questionNumber}. </Text>

        {question.question}
      </Text>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = question.correctAnswer === index;

          const revealCorrect = showAnswer && isCorrect;
          const revealWrong = showAnswer && isSelected && !isCorrect;

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedAnswer(index)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                revealCorrect && styles.optionCorrect,
                revealWrong && styles.optionWrong,
                pressed && styles.optionPressed
              ]}
            >
              <View
                style={[
                  styles.optionLetter,
                  isSelected && styles.optionLetterSelected,
                  revealCorrect && styles.optionLetterCorrect,
                  revealWrong && styles.optionLetterWrong
                ]}
              >
                <Text style={styles.optionLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowAnswer((prev) => !prev)}
        style={({ pressed }) => [
          styles.showAnswer,
          pressed && styles.showAnswerPressed
        ]}
      >
        <Text style={styles.showAnswerText}>
          {showAnswer ? "Hide Answer ▲" : "Show Answer ▼"}
        </Text>
      </Pressable>

      {showAnswer ? (
        <View style={styles.answer}>
          <Text style={styles.answerText}>
            <Text style={styles.answerLabel}>Answer: </Text>

            {String.fromCharCode(65 + question.correctAnswer)}
            {". "}
            {question.options[question.correctAnswer]}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },

  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft
  },

  typeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700"
  },

  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth
  },

  difficultyText: {
    fontSize: 11,
    fontWeight: "700"
  },

  marks: {
    marginLeft: "auto",
    color: colors.faint,
    fontSize: 11,
    fontWeight: "600"
  },

  question: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600"
  },

  questionNumber: {
    color: colors.primary,
    fontWeight: "700"
  },

  options: {
    marginTop: spacing.md,
    gap: spacing.sm
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: "transparent"
  },

  optionPressed: {
    opacity: 0.75
  },

  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },

  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft
  },

  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft
  },

  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border
  },

  optionLetterSelected: {
    backgroundColor: colors.accent
  },

  optionLetterCorrect: {
    backgroundColor: colors.success
  },

  optionLetterWrong: {
    backgroundColor: colors.danger
  },

  optionLetterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },

  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },

  showAnswer: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    alignItems: "center"
  },

  showAnswerPressed: {
    backgroundColor: colors.primarySoft
  },

  showAnswerText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700"
  },

  answer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft
  },

  answerText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },

  answerLabel: {
    color: colors.success,
    fontWeight: "700"
  }
});

export default MCQCard;
