import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

export interface ReviewItemProps {
  id: string;
  title: string;
  contractor: string;
  date: string;
  rating: number;
  description?: string;
}

const ReviewItem = ({ title, contractor, date, rating, description }: ReviewItemProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{contractor}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color={palette.white} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.dateLabel}>{date}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleBlock: {
    flex: 1,
    marginRight: SPACING.sm,
    gap: 2,
  },
  title: {
    fontSize: FONT.lg,
    color: palette.text,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.tint,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  ratingText: {
    color: palette.white,
    marginLeft: 4,
    fontWeight: "600",
    fontFamily: fontFamilies.rounded,
  },
  dateLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  description: {
    fontSize: FONT.md,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    lineHeight: 20,
  },
});

export default ReviewItem;