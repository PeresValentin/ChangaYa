import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileHeader, { type ProfileHeaderAction } from "../../components/profile/ProfileHeader";
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

const PerfilPublicoScreen = () => {
  const { id: rawId, changaId: rawChangaId } =
    useLocalSearchParams<{ id?: string | string[]; changaId?: string | string[] }>();
  const profileId = Array.isArray(rawId) ? rawId[0] : rawId;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const changaId = Array.isArray(rawChangaId) ? rawChangaId[0] : rawChangaId;
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignedHere, setIsAssignedHere] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  useEffect(() => {
    const loadViewerData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const extractedId =
          parsedUser?.usuarioID ||
          parsedUser?.usuarioId ||
          parsedUser?.id ||
          parsedUser?._id ||
          parsedUser?.userId;

        if (extractedId) {
          setViewerId(String(extractedId));
        }

        if (typeof parsedUser?.tipoUsuario === "string") {
          setViewerRole(parsedUser.tipoUsuario);
        }
      } catch (storageError) {
        console.error("Error al leer el usuario almacenado", storageError);
      }
    };

    loadViewerData();
  }, []);

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

  useEffect(() => {
    setIsAssignedHere(false);
  }, [changaId, profileId]);


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

  const normalizedViewerRole = viewerRole ? viewerRole.toLowerCase() : null;
  const normalizedProfileRole = profile?.role ? profile.role.toLowerCase() : null;
  const isViewerContratante = normalizedViewerRole === "contratante";
  const isViewerTrabajador = normalizedViewerRole === "trabajador";
  const isProfileTrabajador = normalizedProfileRole === "trabajador";
  const isProfileContratante = normalizedProfileRole === "contratante";
  const isOwnProfile = Boolean(profile && viewerId && profile.id === viewerId);
  const canHire = Boolean(
    changaId &&
      isViewerContratante &&
      isProfileTrabajador &&
      !isOwnProfile,
  );
   const canMessage = Boolean(
    profile &&
      viewerId &&
      profile.id !== viewerId &&
      ((isViewerContratante && isProfileTrabajador) ||
        (isViewerTrabajador && isProfileContratante)),
  );
  const handleMessagePress = useCallback(async () => {
    if (!canMessage || !profile) return;

    if (!API_URL) {
      Alert.alert("Configuración incompleta", "No encontramos la URL de la API.");
      return;
    }

    try {
      setIsOpeningChat(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Sesión expirada", "Iniciá sesión nuevamente para continuar.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const chatsResponse = await axios.get(`${API_URL}/api/chats/mine`, {
        headers,
      });

      const chats: any[] = Array.isArray(chatsResponse.data) ? chatsResponse.data : [];
      const findOtherUserId = (chatUser?: ApiUser | null) => {
        if (!chatUser) return null;
        return (
          chatUser.usuarioID ??
          chatUser.usuarioId ??
          chatUser.id ??
          chatUser._id ??
          chatUser.userId ??
          null
        );
      };

      const existingChat = chats.find((chat) => {
        const otherUserId = findOtherUserId(chat?.otroUsuario);
        return otherUserId && String(otherUserId) === profile.id;
      });

      const navigateToChat = (chatId: string) => {
        router.push({ pathname: "/chats/[id]", params: { id: chatId } });
      };

      if (existingChat?.chatID) {
        navigateToChat(String(existingChat.chatID));
        return;
      }

      if (!isViewerContratante) {
        Alert.alert(
          "Chat no disponible",
          "Todavía no tenés un chat abierto con esta persona. Pedile que te envíe un mensaje.",
        );
        return;
      }

      const createResponse = await axios.post(
        `${API_URL}/api/chats`,
        { usuario2: profile.id },
        { headers },
      );

      const createdChat = createResponse.data;
      const createdChatId = createdChat?.chatID ?? createdChat?.chatId ?? createdChat?.id;

      if (createdChatId) {
        navigateToChat(String(createdChatId));
        return;
      }

      Alert.alert("Error", "No pudimos abrir el chat. Intentá nuevamente.");
    } catch (messageError: any) {
      console.error("Error al abrir chat", messageError?.response?.data || messageError);
      const backendMessage = messageError?.response?.data?.error
        ? String(messageError.response.data.error)
        : "No pudimos abrir el chat. Intentá nuevamente.";
      Alert.alert("Error", backendMessage);
    } finally {
      setIsOpeningChat(false);
    }
  }, [API_URL, canMessage, isViewerContratante, profile, router]);

  const performAssignment = useCallback(async () => {
    if (!canHire || !profile || !changaId) return;
    if (!API_URL) {
      Alert.alert("Configuración incompleta", "No encontramos la URL de la API.");
      return;
    }

    try {
      setIsAssigning(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Sesión expirada", "Iniciá sesión nuevamente para continuar.");
        return;
      }

        const headers = { Authorization: `Bearer ${token}` };
      const workerId = String(profile.id);
      const payload = {
        estado: "iniciada",
        trabajadores: [workerId],
      };

      await axios.put(
        `${API_URL}/api/changas/${changaId}`,
        payload,
        { headers },
      );
      setIsAssignedHere(true);
      Alert.alert("Trabajador asignado", `${profile.name} fue asignado a la changa.`);
    } catch (assignError: any) {
      console.error("Error al asignar trabajador", assignError?.response?.data || assignError);
      const backendMessage = assignError?.response?.data?.error
        ? String(assignError.response.data.error)
        : "No pudimos asignar al trabajador. Intentá nuevamente.";
      Alert.alert("Error", backendMessage);
    } finally {
      setIsAssigning(false);
    }
  }, [API_URL, canHire, changaId, profile]);

  const handleHirePress = useCallback(() => {
    if (!canHire || !profile) return;

    Alert.alert(
      "Confirmar contratación",
      `¿Querés asignar a ${profile.name} a esta changa?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", style: "default", onPress: performAssignment },
      ],
    );
  }, [canHire, performAssignment, profile]);

  const headerActions = useMemo(() => {
    const actions: ProfileHeaderAction[] = [];

    if (canMessage) {
      const isPrimaryOnlyAction = !canHire;
      actions.push({
        label: isOpeningChat ? "Abriendo..." : "Mensaje",
        icon: "chatbubble-ellipses-outline",
        variant: isPrimaryOnlyAction ? ("primary" as const) : ("secondary" as const),
        onPress: isOpeningChat ? undefined : handleMessagePress,
        disabled: isOpeningChat,
        rightAdornment: isOpeningChat ? (
          <ActivityIndicator size="small" color={isPrimaryOnlyAction ? palette.white : palette.tint} style={{ marginLeft: 6 }} />
        ) : undefined,
      });
    }

    if (canHire) {
      actions.push({
        label: isAssignedHere ? "Asignado" : isAssigning ? "Contratando..." : "Contratar",
        icon: "briefcase-outline",
        variant: "primary",
        onPress: isAssignedHere ? undefined : handleHirePress,
        disabled: isAssigning || isAssignedHere,
        rightAdornment: isAssigning ? (
          <ActivityIndicator size="small" color={palette.white} style={{ marginLeft: 6 }} />
        ) : undefined,
      });
    }

    return actions.length > 0 ? actions : undefined;
  }, [canHire, canMessage, handleHirePress, handleMessagePress, isAssignedHere, isAssigning, isOpeningChat]);


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
          actions={headerActions}
          
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