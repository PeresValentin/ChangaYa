import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

type ActionVariant = "primary" | "secondary";

export interface ProfileHeaderAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: ActionVariant;
  rightAdornment?: ReactNode;
}

interface ProfileHeaderProps {
  name: string;
  location: string;
  rating: number;
  completedJobs?: number;
  avatarInitials: string;
  actions?: ProfileHeaderAction[];
  showSettings?: boolean;
  onSettingsPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ProfileHeader = ({
  name,
  location,
  rating,
  completedJobs,
  avatarInitials,
  actions,
  showSettings,
  onSettingsPress,
  style,
}: ProfileHeaderProps) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{avatarInitials}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={palette.muted}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Ionicons
                  name="star"
                  size={14}
                  color={palette.white}
                  style={styles.ratingIcon}
                />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
              {typeof completedJobs === "number" && (
                <Text style={styles.metaText}>
                  {completedJobs} changas completadas
                </Text>
              )}
            </View>
          </View>
        </View>
        {showSettings ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes del perfil"
            style={styles.settingsButton}
            onPress={onSettingsPress}
            activeOpacity={0.85}
          >
            <Ionicons name="settings-outline" size={22} color={palette.tint} />
          </TouchableOpacity>
        ) : null}
      </View>

      {actions && actions.length > 0 ? (
        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.actionButton,
                action.variant === "secondary"
                  ? styles.actionButtonSecondary
                  : styles.actionButtonPrimary,
              ]}
              onPress={action.onPress}
              activeOpacity={0.85}
            >
              <Ionicons
                name={action.icon}
                size={18}
                color={
                  action.variant === "secondary" ? palette.tint : palette.white
                }
                style={styles.actionIcon}
              />
              <Text
                style={[
                  styles.actionLabel,
                  action.variant === "secondary" && styles.actionLabelSecondary,
                ]}
              >
                {action.label}
              </Text>
              {action.rightAdornment}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
    gap: SPACING.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  avatarWrapper: {
    flexDirection: "row",
    flex: 1,
    gap: SPACING.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: palette.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: palette.white,
    fontSize: FONT.xl,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT.xxl,
    fontWeight: "700",
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  locationIcon: {
    marginRight: SPACING.xs,
  },
  locationText: {
    color: palette.muted,
    fontSize: FONT.md,
    fontFamily: fontFamilies.rounded,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.tint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  ratingIcon: {
    marginRight: 4,
  },
  ratingText: {
    color: palette.white,
    fontFamily: fontFamilies.rounded,
    fontSize: FONT.md,
    fontWeight: "600",
  },
  metaText: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  actionButtonPrimary: {
    backgroundColor: palette.tint,
  },
  actionButtonSecondary: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionIcon: {
    marginRight: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONT.md,
    color: palette.white,
    fontFamily: fontFamilies.rounded,
    fontWeight: "600",
  },
  actionLabelSecondary: {
    color: palette.tint,
  },
});

export default ProfileHeader;