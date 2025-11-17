import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type ApiPerfil = {
  descripcion?: string | null;
};


type ApiUser = {
  usuarioID?: string | number;
  usuarioId?: string | number;
  id?: string | number;
  _id?: string | number;
  userId?: string | number;
  nombre?: string | null;
  apellido?: string | null;
  nombreUsuario?: string | null;
  ubicacion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  descripcion?: string | null;
  sobreMi?: string | null;
  habilidades?: string[] | string | null;
  rankingGeneral?: number | null;
  changasCompletadas?: number | null;
  changasRealizadas?: number | null;
};

type PublicProfile = {
  id: string;
  name: string;
  location: string;
  rating: number;
  completedJobs?: number;
  generalScore?: number | null;
  about: string;
  topSkills: SkillItem[];
  reviews: ReviewItemProps[];
};

const sanitizeText = (value?: string | null) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const buildDisplayName = (user: ApiUser) => {
  const composed =
    [sanitizeText(user.nombre), sanitizeText(user.apellido)]
      .filter(Boolean)
      .join(" ")
      .trim();

  const candidates = [composed, sanitizeText(user.nombreUsuario)];
  const valid = candidates.find((candidate) => Boolean(candidate));
  return valid || "Usuario";
};

const buildLocation = (user: ApiUser) => {
  const locationCandidates = [
    sanitizeText(user.ubicacion),
    sanitizeText(user.direccion),
    [sanitizeText(user.ciudad), sanitizeText(user.provincia)]
      .filter(Boolean)
      .join(", "),
  ].map((candidate) => candidate.trim()).filter(Boolean);

  return locationCandidates[0] || "Ubicación sin especificar";
};

const parseSkills = (skills: ApiUser["habilidades"]): SkillItem[] => {
  if (!skills) return [];

  const normalizedArray = Array.isArray(skills)
    ? skills
    : String(skills)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return normalizedArray.map((label, index) => ({
    id: `${label}-${index}`,
    label,
    level: Math.max(0.3, 1 - index * 0.15),
  }));
};

const mapUserToPublicProfile = (user: ApiUser, perfil: ApiPerfil | null, fallbackId: string): PublicProfile => {
  const rating = typeof user.rankingGeneral === "number" ? user.rankingGeneral : 0;
  const normalizedScore = rating > 0 ? Math.min(1, Math.max(0, rating / 5)) : null;
  const completedJobs =
    typeof user.changasCompletadas === "number"
      ? user.changasCompletadas
      : typeof user.changasRealizadas === "number"
      ? user.changasRealizadas
      : undefined;

  const aboutText =
    sanitizeText(perfil?.descripcion) ||
    sanitizeText(user.descripcion) ||
    sanitizeText(user.sobreMi) ||
    "Este usuario aún no agregó una descripción.";

  const profileId =
    user.usuarioID ?? user.usuarioId ?? user.id ?? user._id ?? user.userId ?? fallbackId;

  return {
    id: String(profileId),
    name: buildDisplayName(user),
    location: buildLocation(user),
    rating,
    completedJobs,
    generalScore: normalizedScore,
    about: aboutText,
    topSkills: parseSkills(user.habilidades),
    reviews: [],
  };
};

const buildInitials = (name: string) => {
  if (!name) return "?";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || name.charAt(0).toUpperCase() || "?";
};

const PerfilPublicoScreen = () => {
  const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
  const profileId = Array.isArray(rawId) ? rawId[0] : rawId;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setErrorMessage("No encontramos el perfil solicitado.");
        setIsLoading(false);
        return;
      }

       if (!API_URL) {
        setErrorMessage("La aplicación no tiene configurada la URL de la API.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          setErrorMessage("Tu sesión expiró. Iniciá sesión nuevamente.");
          setIsLoading(false);
          return;
        }

         const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get<ApiUser>(`${API_URL}/api/usuarios/public/${profileId}`, {
          headers,
        });

        let perfilData: ApiPerfil | null = null;
        try {
          const perfilResponse = await axios.get<ApiPerfil>(`${API_URL}/api/perfil/usuario/${profileId}`, {
            headers,
          });
          perfilData = perfilResponse.data;
        } catch (perfilError: any) {
          if (perfilError?.response?.status !== 404) {
            console.warn("No pudimos obtener el perfil extendido", perfilError?.response?.data || perfilError);
          }
        }

        setProfile(mapUserToPublicProfile(response.data, perfilData, profileId));
      } catch (error: any) {
        console.error("Error al cargar el perfil público", error?.response?.data || error);
        const backendMessage =
          typeof error?.response?.data?.error === "string"
            ? error.response.data.error
            : "No pudimos cargar el perfil.";
        setErrorMessage(backendMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, profileId]);

  const initials = buildInitials(profile?.name ?? "");
  const generalScorePercent = profile
    ? Math.round(
        Math.min(
          1,
          Math.max(
            0,
            profile.generalScore != null ? profile.generalScore : profile.rating > 0 ? profile.rating / 5 : 0,
          ),
        ) * 100,
      )
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: SPACING.lg }} color={palette.tint} size="large" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.sectionTitle}>Ups...</Text>
          <Text style={styles.bodyText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.sectionTitle}>No encontramos el perfil solicitado.</Text>
          <Text style={styles.bodyText}>Intentá nuevamente en unos minutos.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
           {profile.completedJobs
              ? `Basado en ${profile.completedJobs} changas completadas.`
              : "Seguimos recopilando reseñas de este usuario."}
          </Text>
        </View>

        {profile.topSkills.length > 0 ? (
          <SkillsList title="Habilidades" skills={profile.topSkills} />
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bodyText}>{profile.about}</Text>
        </View>
        {profile.reviews.length > 0 ? (
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
        ) : null}
          
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
  errorContainer: {
    padding: SPACING.lg,
    gap: SPACING.sm,
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