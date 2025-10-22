// Front/ChangaYa-App/app/perfil/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProfileHeader from "../../components/profile/ProfileHeader";
import SkillsList from "../../components/profile/SkillsList";
import ReviewItem from "../../components/profile/ReviewItem";
import theme from "../../constants/theme";
import { useProfileNavigation } from "@/hooks/use-profile-navigation"; // añadido

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

const USER_PROFILE = {
  id: "worker-001", // añadido para coherencia con los perfiles públicos mockeados
  name: "María Rodríguez",
  location: "La Plata, Buenos Aires",
  rating: 4.8,
  completedJobs: 132,
  generalScore: 0.92,
  about:
    "Amante de las soluciones prácticas y prolijas. Busco que cada cliente sienta tranquilidad sabiendo que su hogar está en buenas manos.",
  topSkills: [
    { id: "skill-plomeria", label: "Plomería", level: 0.97, color: "#6BA368" },
    { id: "skill-gas", label: "Instalaciones de gas", level: 0.9, color: "#A1E99D" },
    { id: "skill-electricidad", label: "Electricidad", level: 0.86, color: "#CFE6CD" },
    { id: "skill-pintura", label: "Pintura", level: 0.78, color: "#90C99F" },
    { id: "skill-mantenimiento", label: "Mantenimiento general", level: 0.74, color: "#B7E4C7" },
  ],
  reviews: [
    {
      id: "review-1",
      title: "Reparación de caño en cocina",
      contractor: "Carlos Pérez",
      date: "12 de marzo 2024",
      rating: 4.9,
      description:
        "María llegó en menos de una hora y solucionó el problema sin inconvenientes. Además dejó todo impecable y me explicó cómo evitar que vuelva a suceder.",
    },
    {
      id: "review-2",
      title: "Instalación de termotanque",
      contractor: "Lorena Díaz",
      date: "28 de febrero 2024",
      rating: 4.7,
      description:
        "Excelente trabajo, muy cuidadosa con los detalles y cumplió con los tiempos acordados.",
    },
  ],
};

const ACCOUNT_OPTIONS = [
  { id: "favorites", label: "Favoritas", icon: "heart-outline" },
  { id: "history", label: "Historial", icon: "time-outline" },
  { id: "payments", label: "Métodos de pago", icon: "card-outline" },
  { id: "notifications", label: "Notificaciones", icon: "notifications-outline" },
  { id: "logout", label: "Cerrar sesión", icon: "log-out-outline" },
] as const;

const PerfilPrivadoScreen = () => {
  const initials = USER_PROFILE.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const generalScorePercent = Math.round(
    Math.min(1, Math.max(0, USER_PROFILE.generalScore)) * 100
  );

  const { currentUserId } = useProfileNavigation(); // coherencia futura con navegación centralizada

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Mi Perfil",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={USER_PROFILE.name}
          location={USER_PROFILE.location}
          rating={USER_PROFILE.rating}
          completedJobs={USER_PROFILE.completedJobs}
          avatarInitials={initials}
          showSettings
        />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Puntuación general</Text>
            <Text style={styles.sectionValue}>{generalScorePercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${generalScorePercent}%` },
              ]}
            />
          </View>
          <Text style={styles.sectionHint}>
            Tu promedio se actualiza con cada changa completada.
          </Text>
        </View>

        <SkillsList title="Top 5 habilidades" skills={USER_PROFILE.topSkills} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bodyText}>{USER_PROFILE.about}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Changas realizadas recientemente</Text>
          <View style={styles.reviewList}>
            {USER_PROFILE.reviews.map((review) => (
              <ReviewItem key={review.id} {...review} />
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          <View style={styles.optionsList}>
            {ACCOUNT_OPTIONS.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionItem}>
                <View style={styles.optionIconWrapper}>
                  <Ionicons name={option.icon} size={20} color={palette.tint} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={palette.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingBottom: SPACING.lg * 2,
  },
  sectionCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    color: palette.text,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  sectionValue: {
    fontSize: FONT.lg,
    color: palette.tint,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  progressTrack: {
    height: 12,
    backgroundColor: palette.background,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.tint,
    borderRadius: 999,
  },
  sectionHint: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  bodyText: {
    fontSize: FONT.md,
    lineHeight: 22,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
  },
  reviewList: {
    gap: SPACING.md,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: palette.background,
    gap: SPACING.md,
  },
  optionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  optionLabel: {
    flex: 1,
    fontSize: FONT.md,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
  },
});

export default PerfilPrivadoScreen;

