import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHeader from "../../components/profile/ProfileHeader";
import SkillsList from "../../components/profile/SkillsList";
import ReviewItem from "../../components/profile/ReviewItem";
import theme from "../../constants/theme";
import {
  buildInitials,
  mapUserToPublicProfile,
  type ApiPerfil,
  type ApiUser,
  type PublicProfile,
} from "./profile-utils";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;




const PerfilPrivadoScreen = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!API_URL) {
      setErrorMessage("La aplicación no tiene configurada la URL de la API.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const storedUser = await AsyncStorage.getItem("userData");
      if (!storedUser) {
        setErrorMessage("No encontramos los datos del usuario logueado.");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const extractedId =
        parsedUser?.usuarioID ??
        parsedUser?.usuarioId ??
        parsedUser?.id ??
        parsedUser?._id ??
        parsedUser?.userId;

      if (!extractedId) {
        setErrorMessage("No pudimos identificar tu usuario.");
        return;
      }

      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        setErrorMessage("Tu sesión expiró. Iniciá sesión nuevamente.");
        router.replace("/auth/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const userResponse = await axios.get<ApiUser>(`${API_URL}/api/usuarios/${extractedId}`, {
        headers,
      });

      let perfilData: ApiPerfil | null = null;
      try {
        const perfilResponse = await axios.get<ApiPerfil>(`${API_URL}/api/perfil/usuario/${extractedId}`, {
          headers,
        });
        perfilData = perfilResponse.data;
      } catch (perfilError: any) {
        if (perfilError?.response?.status !== 404) {
          console.warn("No pudimos obtener el perfil extendido", perfilError?.response?.data || perfilError);
        }
      }

      const mappedProfile = mapUserToPublicProfile(userResponse.data, perfilData, String(extractedId));
      setProfile(mappedProfile);
    } catch (error: any) {
      console.error("Error al cargar el perfil privado", error?.response?.data || error);
      const backendMessage =
        typeof error?.response?.data?.error === "string"
          ? error.response.data.error
          : "No pudimos cargar tu perfil.";
      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initials = buildInitials(profile?.name ?? "");
  const generalScorePercent = useMemo(() => {
    if (!profile) return 0;
    const baseScore =
      profile.generalScore != null
        ? profile.generalScore
        : profile.rating > 0
        ? Math.min(1, profile.rating / 5)
        : 0;
    return Math.round(Math.min(1, Math.max(0, baseScore)) * 100);
  }, [profile]);

  const accountInfo = useMemo(() => {
    if (!profile) return [];

    const info = [
      { label: "Rol en ChangaYa", value: profile.role ?? "Sin especificar" },
      { label: "Correo electrónico", value: profile.email ?? "Email no disponible" },
      { label: "Teléfono", value: profile.phone ?? "No informado" },
      { label: "Ubicación", value: profile.location || "Ubicación sin especificar" },
    ];

    if (typeof profile.completedJobs === "number") {
      info.push({ label: "Changas completadas", value: `${profile.completedJobs}` });
    }

    return info;
  }, [profile]);


  const hasSkills = (profile?.topSkills?.length ?? 0) > 0;
  const hasReviews = (profile?.reviews?.length ?? 0) > 0;

  const renderState = () => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={palette.tint} />
          <Text style={styles.stateMessage}>Cargando tu perfil...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>No pudimos cargar tu perfil</Text>
          <Text style={styles.stateMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Tu perfil aún no está disponible.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
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
          showSettings
          onSettingsPress={() => router.push("/profile/settings")}
        />
        
         <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Información de tu cuenta</Text>
          <View style={styles.infoList}>
            {accountInfo.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
           <View style={[styles.progressFill, { width: `${generalScorePercent}%` }]} />
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

         {hasSkills ? (
          <SkillsList title="Top 5 habilidades" skills={profile.topSkills} />
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Top 5 habilidades</Text>
            <Text style={styles.bodyTextMuted}>Todavía no cargaste habilidades destacadas.</Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bodyText}>{profile.about}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Changas realizadas recientemente</Text>
          <View style={styles.reviewList}>
             {hasReviews
              ? profile.reviews.map((review) => <ReviewItem key={review.id} {...review} />)
              : (
                  <Text style={styles.bodyTextMuted}>
                    Todavía no hay reseñas disponibles.
                  </Text>
                )}
          </View>
        </View>
      </ScrollView>
      );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Mi Perfil",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      {renderState()}
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

  infoList: {
    gap: SPACING.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT.md,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
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
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    lineHeight: 22,
  },
  bodyTextMuted: {
    fontSize: FONT.md,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  reviewList: {
    gap: SPACING.sm,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  stateTitle: {
    fontSize: FONT.xl,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
    fontFamily: fontFamilies.rounded,
  },
  stateMessage: {
    fontSize: FONT.md,
    color: palette.muted,
    textAlign: "center",
    fontFamily: fontFamilies.rounded,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: palette.tint,
  },
  retryButtonText: {
    color: palette.white,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
});

export default PerfilPrivadoScreen;

