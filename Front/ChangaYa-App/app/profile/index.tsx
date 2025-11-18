import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "../../components/NavBar";

import ProfileHeader, { type ProfileHeaderAction } from "../../components/profile/ProfileHeader";
import SkillsList from "../../components/profile/SkillsList";
import ReviewItem, { type ReviewItemProps } from "../../components/profile/ReviewItem";
import theme from "../../constants/theme";
import {
  buildInitials,
  buildDisplayName,
  mapUserToPublicProfile,
  sanitizeText,
  type ApiPerfil,
  type ApiUser,
  type PublicProfile,
} from "./profile-utils";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

type ApiResenia = {
  'reseñaID'?: string | number;
  reseniaID?: string | number;
  comentario?: string | null;
  comentarioDestinatario?: string | null;
  descripcion?: string | null;
  comment?: string | null;
  changaID?: string | number;
  changaId?: string | number;
  usuarioID?: string | number;
  usuarioId?: string | number;
  destinatarioID?: string | number;
  destinatarioId?: string | number;
  autorNombre?: string | null;
  autorApellido?: string | null;
  autorNombreCompleto?: string | null;
  autorNombreUsuario?: string | null;
  autorUsuario?: string | null;
  autor?: string | null;
  puntaje?: number | null;
  created_at?: string | null;
  fecha?: string | null;
  calificacion?: number | null;
  rating?: number | null;
  puntajeGeneral?: number | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  fechaCreacion?: string | null;
  fechaResenia?: string | null;
  titulo?: string | null;
  changaTitulo?: string | null;
  tituloChanga?: string | null;
};

type ApiChanga = {
  changaID?: string | number;
  titulo?: string | null;
  descripcion?: string | null;
};

type ChangaDetalleResponse = {
  changa?: ApiChanga;
};

const normalizeId = (value?: string | number | null) => {
  if (value === undefined || value === null) return null;
  return String(value);
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  try {
    return parsed.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return parsed.toISOString().split("T")[0];
  }
};

const buildChangaTitle = (
  changa?: ApiChanga | null,
  fallbackId?: string | null,
  titleCandidate?: string | null,
) => {
  if (changa?.titulo) {
    return `“${changa.titulo}”`;
  }
  if (titleCandidate) {
    return `“${titleCandidate}”`;
  }
  if (fallbackId) {
    return `Changa ${fallbackId}`;
  }
  return "Changa";
};

const fetchUsersMap = async (apiUrl: string, ids: string[]) => {
  const map = new Map<string, ApiUser>();
  if (!ids.length) return map;

  await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await axios.get<ApiUser>(`${apiUrl}/api/usuarios/public/${id}`);
        map.set(id, response.data);
      } catch (error) {
        console.warn("No pudimos obtener el autor de la reseña", id, error);
      }
    }),
  );

  return map;
};

const fetchChangasMap = async (
  apiUrl: string,
  ids: string[],
  headers: Record<string, string>,
) => {
  const map = new Map<string, ApiChanga>();
  if (!ids.length) return map;

  await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await axios.get<ChangaDetalleResponse>(`${apiUrl}/api/changas/detalle/${id}`, { headers });
        if (response.data?.changa) {
          map.set(id, response.data.changa);
        }
      } catch (error) {
        console.warn("No pudimos obtener la changa asociada a una reseña", id, error);
      }
    }),
  );

  return map;
};

const fetchReviewsForUser = async (
  apiUrl: string,
  userId: string,
  headers: Record<string, string>,
): Promise<ReviewItemProps[]> => {
  try {
    const response = await axios.get<ApiResenia[]>(`${apiUrl}/api/resenia`, { headers });
    const rawReviews = Array.isArray(response.data) ? response.data : [];
    const relevantReviews = rawReviews.filter((review) => {
      const recipientId =
        normalizeId(review.destinatarioID) ?? normalizeId(review.destinatarioId);
      return recipientId === userId;
    });

    if (!relevantReviews.length) {
      return [];
    }

    const authorIds = Array.from(
      new Set(
        relevantReviews
          .map((review) => normalizeId(review.usuarioID) ?? normalizeId(review.usuarioId))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const changaIds = Array.from(
      new Set(
        relevantReviews
          .map((review) => normalizeId(review.changaID) ?? normalizeId(review.changaId))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const [authorsMap, changasMap] = await Promise.all([
      fetchUsersMap(apiUrl, authorIds),
      fetchChangasMap(apiUrl, changaIds, headers),
    ]);

    return relevantReviews.map((review) => {
      const reviewId =
        normalizeId(review['reseñaID']) ??
        normalizeId(review.reseniaID) ??
        `${userId}-${normalizeId(review.usuarioID ?? review.usuarioId) ?? "0"}-${normalizeId(review.changaID ?? review.changaId) ?? "0"}`;

      const authorId = normalizeId(review.usuarioID) ?? normalizeId(review.usuarioId);
      const changaId = normalizeId(review.changaID) ?? normalizeId(review.changaId);
      const author = authorId ? authorsMap.get(authorId) : null;
      const changa = changaId ? changasMap.get(changaId) : null;
       const rawRatingCandidates = [
        review.puntaje,
        review.calificacion,
        review.rating,
        review.puntajeGeneral,
      ];
      const rawRating = rawRatingCandidates.find((value) => typeof value === "number");
      const rating =
        typeof rawRating === "number" ? Math.max(0, Math.min(5, rawRating)) : 0;

      const rawDateValue =
        review.fecha ??
        review.created_at ??
        review.createdAt ??
        review.updated_at ??
        review.updatedAt ??
        review.fechaCreacion ??
        review.fechaResenia ??
        null;

      const reviewAuthorNameCandidates = [
        [review.autorNombre, review.autorApellido].filter(Boolean).join(" ").trim(),
        sanitizeText(review.autorNombreCompleto ?? null),
        sanitizeText(review.autorNombreUsuario ?? null),
        sanitizeText(review.autorUsuario ?? null),
        sanitizeText(review.autor ?? null),
      ].filter(Boolean);

      const reviewAuthorName = reviewAuthorNameCandidates[0] || null;
      const contractor = author
        ? buildDisplayName(author)
        : reviewAuthorName || "Usuario de ChangaYa";

      const commentCandidates = [
        review.comentario,
        review.comentarioDestinatario,
        review.descripcion,
        review.comment,
      ];

      const description =
        commentCandidates.find((value) => typeof value === "string" && value.trim().length) ??
        null;

      const rawTitleCandidate =
        sanitizeText(review.titulo ?? null) ||
        sanitizeText(review.changaTitulo ?? null) ||
        sanitizeText(review.tituloChanga ?? null);

      return {
        id: reviewId,
        title: buildChangaTitle(changa, changaId, rawTitleCandidate ?? null),
        contractor,
        date: formatDisplayDate(rawDateValue) ?? "Fecha no disponible",
        rating,
        description: description ?? undefined,
      };
    });
  } catch (error) {
    console.error("Error al obtener las reseñas del perfil privado", error);
    return [];
  }
};





const PerfilPrivadoScreen = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const [reviewsSectionY, setReviewsSectionY] = useState<number | null>(null);

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

       const reviews = await fetchReviewsForUser(API_URL, String(extractedId), headers);
      const mappedProfile = mapUserToPublicProfile(userResponse.data, perfilData, String(extractedId), {
        reviews,
      });
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

 useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

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
     const roleLabel = profile.role
      ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
      : "Sin especificar";

     const info = [
      { label: "Rol en ChangaYa", value: roleLabel },
      { label: "Correo electrónico", value: profile.email ?? "Email no disponible" },
      { label: "Teléfono", value: profile.phone ?? "No informado" },
      { label: "Ubicación", value: profile.location || "Ubicación sin especificar" },
    ];

    const memberSince = profile.joinedAt
      ? formatDisplayDate(profile.joinedAt) ?? profile.joinedAt
      : null;

    if (memberSince) {
      info.push({ label: "Miembro desde", value: memberSince });
    }

    if (typeof profile.completedJobs === "number") {
      info.push({ label: "Changas completadas", value: `${profile.completedJobs}` });
    }

    return info;
  }, [profile]);


  const hasSkills = (profile?.topSkills?.length ?? 0) > 0;
  const hasReviews = (profile?.reviews?.length ?? 0) > 0;

  const generalScoreHint = useMemo(() => {
    if (!profile) {
      return "Tu promedio se actualiza con cada changa completada.";
    }

    if (hasReviews) {
      const count = profile.reviews.length;
      return `Basado en ${count} reseña${count === 1 ? "" : "s"}.`;
    }

    if (profile.completedJobs) {
      return `Tu promedio se actualizará con las ${profile.completedJobs} changas completadas.`;
    }

    return "Tu promedio se actualiza con cada changa completada.";
  }, [hasReviews, profile]);

  const handleScrollToReviews = useCallback(() => {
    if (!scrollRef.current) return;
    const target = reviewsSectionY ?? 0;
    scrollRef.current.scrollTo({ y: Math.max(0, target - SPACING.lg), animated: true });
  }, [reviewsSectionY]);

  const headerActions = useMemo<ProfileHeaderAction[] | undefined>(() => {
    if (!profile) return undefined;

    return [
      {
        label: hasReviews ? "Ver reseñas" : "Sin reseñas",
        icon: "star-outline",
        variant: "secondary",
        onPress: hasReviews ? handleScrollToReviews : undefined,
        disabled: !hasReviews,
      },
      {
        label: "Historial",
        icon: "time-outline",
        variant: "secondary",
        onPress: () => router.push("/changas/mis"),
      },
      {
        label: "Mensajes",
        icon: "chatbubble-ellipses-outline",
        variant: "primary",
        onPress: () => router.push("/chats"),
      },
    ];
  }, [handleScrollToReviews, hasReviews, profile, router]);


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
       ref={scrollRef}
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
          avatarUrl={profile.avatarUrl}
          actions={headerActions}
        />
        
           <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Información de tu cuenta</Text>
          <View style={styles.infoList}>
            {accountInfo.map((item, index) => {
              const isLast = index === accountInfo.length - 1;
              return (
                <View
                  key={item.label}
                  style={[styles.infoRow, !isLast && styles.infoRowDivider]}
                >
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
           <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tu reputación general</Text>
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
          <Text style={styles.sectionHint}>{generalScoreHint}</Text>
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
          <Text style={styles.bodyText}>
            {profile.about?.trim()
              ? profile.about
              : "Todavía no agregaste una descripción personal."}
          </Text>
        </View>

         <View
          style={styles.sectionCard}
          onLayout={(event) => setReviewsSectionY(event.nativeEvent.layout.y)}
        >
          <Text style={styles.sectionTitle}>Tus reseñas</Text>
          <View style={styles.reviewList}>
            {hasReviews ? (
              profile.reviews.map((review) => <ReviewItem key={review.id} {...review} />)
            ) : (
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
      <View style={styles.container}>
        {renderState()}
        <NavBar />
      </View>
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
   container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
     paddingBottom: SPACING.lg * 6,
  },
  sectionCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
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
    gap: SPACING.sm,
  },
  infoRow: {
    gap: 2,
    paddingVertical: SPACING.xs,
  },
  infoRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  infoLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
    paddingBottom: SPACING.lg * 4,
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

