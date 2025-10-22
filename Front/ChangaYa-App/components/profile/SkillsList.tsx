import { StyleSheet, Text, View } from "react-native";

import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

export interface SkillItem {
  id: string;
  label: string;
  level: number; // value between 0 and 1
  color?: string;
}

interface SkillsListProps {
  title?: string;
  skills: SkillItem[];
}

const SkillsList = ({ title, skills }: SkillsListProps) => {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.list}>
        {skills.map((skill) => {
          const percentage = Math.round(skill.level * 100);
          return (
            <View key={skill.id} style={styles.skillCard}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillLabel}>{skill.label}</Text>
                <Text style={styles.skillValue}>{percentage}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, percentage))}%`,
                      backgroundColor: skill.color ?? palette.tint,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: "700",
    color: palette.text,
    fontFamily: fontFamilies.rounded,
  },
  list: {
    gap: SPACING.sm,
  },
  skillCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  skillLabel: {
    fontSize: FONT.md,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    fontWeight: "600",
  },
  skillValue: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.background,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});

export default SkillsList;