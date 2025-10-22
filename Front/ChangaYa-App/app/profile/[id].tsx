import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ProfileHeader from "../../components/profile/ProfileHeader";
import SkillsList, {
  type SkillItem,
} from "../../components/profile/SkillsList";
import ReviewItem, {
  type ReviewItemProps,
} from "../../components/profile/ReviewItem";
import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

type PublicProfile = {
  id: string;
  name: string;
  location: string;
  rating: number;
  completedJobs: number;
  generalScore: number;
  about: string;
  topSkills: SkillItem[];
  reviews: ReviewItemProps[];
};

const MOCK_PROFILES: PublicProfile[] = [
  {
    id: "worker-001",
    name: "María Rodríguez",
    location: "La Plata, Buenos Aires",
    rating: 4.8,
    completedJobs: 132,
    generalScore: 0.92,
    about:
      "Plomera certificada con más de 6 años de experiencia. Me especializo en reparaciones urgentes, instalaciones nuevas y mantenimiento preventivo. Me encanta trabajar de manera prolija y mantener informado al cliente durante cada etapa.",
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
      {
        id: "review-3",
        title: "Mantenimiento general del baño",
        contractor: "Javier Gómez",
        date: "18 de enero 2024",
        rating: 4.8,
        description:
          "Realizó varias reparaciones pequeñas y dejó todo funcionando perfecto. Muy recomendable.",
      },
    ],
  },
   {
    id: "worker-002",
    name: "Ana Martínez",
    location: "Quilmes, Buenos Aires",
    rating: 4.6,
    completedJobs: 88,
    generalScore: 0.89,
    about:
      "Electricista matriculada con foco en instalaciones domiciliarias seguras y eficientes. Disfruto acompañar al cliente en cada paso para que entienda qué estoy haciendo en su hogar.",
    topSkills: [
      { id: "skill-electrica", label: "Instalaciones eléctricas", level: 0.92, color: "#6BA368" },
      { id: "skill-domotica", label: "Automatización hogareña", level: 0.82, color: "#A1E99D" },
      { id: "skill-seguridad", label: "Seguridad eléctrica", level: 0.9, color: "#90C99F" },
      { id: "skill-diagnostico", label: "Diagnóstico rápido", level: 0.85, color: "#CFE6CD" },
    ],
    reviews: [
      {
        id: "review-ana-1",
        title: "Instalación de lámparas inteligentes",
        contractor: "Marina Suárez",
        date: "5 de febrero 2024",
        rating: 4.8,
        description:
          "Ana explicó cada paso con mucha claridad y dejó todo funcionando perfecto. Super recomendada.",
      },
      {
        id: "review-ana-2",
        title: "Revisión tablero eléctrico",
        contractor: "Diego Ramos",
        date: "21 de enero 2024",
        rating: 4.5,
        description:
          "Detectó un problema que otros técnicos no habían visto y lo resolvió al instante.",
      },
    ],
  },
  {
    id: "contractor-123",
    name: "Carlos Pérez",
    location: "City Bell, Buenos Aires",
    rating: 4.7,
    completedJobs: 58,
    generalScore: 0.88,
    about:
      "Contratante habitual de ChangaYa. Me enfoco en mantener relaciones de trabajo justas, pagar a tiempo y dejar reseñas detalladas para ayudar a otros trabajadores.",
    topSkills: [
      { id: "skill-planificacion", label: "Planificación", level: 0.84, color: "#6BA368" },
      { id: "skill-comunicacion", label: "Comunicación", level: 0.88, color: "#A1E99D" },
      { id: "skill-negociacion", label: "Negociación", level: 0.8, color: "#90C99F" },
    ],
    reviews: [
      {
        id: "review-carlos-1",
        title: "Instalación de cortinas",
        contractor: "María Rodríguez",
        date: "8 de marzo 2024",
        rating: 4.9,
        description:
          "Carlos fue claro con los requerimientos y pagó al instante. Excelente experiencia como contratante.",
      },
      {
        id: "review-carlos-2",
        title: "Pintura interior",
        contractor: "Ana Martínez",
        date: "30 de enero 2024",
        rating: 4.6,
        description:
          "Muy organizado y respetuoso. Coordinamos horarios sin problema y la comunicación fue excelente.",
      },
    ],
  },
];

const PerfilPublicoScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const profile =
    MOCK_PROFILES.find((item) => item.id === id) ?? MOCK_PROFILES[0];
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const generalScorePercent = Math.round(
    Math.min(1, Math.max(0, profile.generalScore)) * 100,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: profile.name,
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
          name={profile.name}
          location={profile.location}
          rating={profile.rating}
          completedJobs={profile.completedJobs}
          avatarInitials={initials}
          actions={[
            {
              label: "Mensaje",
              icon: "chatbubble-ellipses-outline",
              variant: "secondary",
            },
            {
              label: "Contratar",
              icon: "briefcase-outline",
              variant: "primary",
            },
          ]}
        />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Puntuación general</Text>
            <Text style={styles.sectionValue}>
              {generalScorePercent}%
            </Text>
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
            Basado en {profile.completedJobs} changas completadas.
          </Text>
        </View>

        <SkillsList title="Top 5 habilidades" skills={profile.topSkills} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bodyText}>{profile.about}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Changas realizadas</Text>
            <View style={styles.reviewsBadge}>
              <Ionicons name="medal-outline" size={16} color={palette.tint} />
              <Text style={styles.reviewsBadgeText}>
                {profile.reviews.length} reseñas recientes
              </Text>
            </View>
          </View>
          <View style={styles.reviewList}>
            {profile.reviews.map((review) => (
              <ReviewItem key={review.id} {...review} />
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
  reviewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 6,
  },
  reviewsBadgeText: {
    fontSize: FONT.sm,
    color: palette.tint,
    fontFamily: fontFamilies.rounded,
    fontWeight: "600",
  },
});

export default PerfilPublicoScreen;