import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, type Href } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HelloWave } from "../../components/hello-wave";
import theme from "../../constants/theme";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useProfileNavigation } from "../../hooks/use-profile-navigation";

// CONSTANTES DEL TEMA
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
// =========================================================
// DATOS DE EJEMPLO (Refactorizados al nuevo diseño)
// =========================================================
const quickActions = [
  {
    id: "plomeria",
    title: "Plomería",
    description: "Reparaciones",
    icon: "build-outline" as const,
    route: "/changas/nueva?categoria=plomeria",
  },
  {
    id: "limpieza",
    title: "Limpieza",
    description: "Del hogar",
    icon: "sparkles-outline" as const,
    route: "/changas/nueva?categoria=limpieza",
  },
  {
    id: "envios",
    title: "Delivery",
    description: "Envíos",
    icon: "bicycle-outline" as const,
    route: "/changas/nueva?categoria=envios",
  },
];

const summaryData = {
  completadas: 8,
  calificacion: 4.8,
};
const quickLinks: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}[] = [
  {
    id: "home",
    title: "Home",
    icon: "home-outline" as const,
    route: "/home/trabajador" as Href,
  },
  {
    id: "chats",
    title: "Chats",
    icon: "chatbubble-ellipses-outline" as const,
    route: "/chats" as Href,
  },
  {
    id: "mis-changas",
    title: "Mis Changas",
    icon: "briefcase-outline" as const,
    route: "/changas/mis" as Href,
  },
  {
    id: "perfil",
    title: "Perfil",
    icon: "person-circle-outline" as const,

    route: "/perfil" as Href,

  },
];
// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function InicioContratanteScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const router = useRouter();
  
  const pathname = usePathname();

  const initials = useMemo(() => "Valentin".charAt(0), []);

  const { goToProfile } = useProfileNavigation();

  const [changas, setChangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChangasByContratante = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          Alert.alert("Sesión expirada", "Volvé a iniciar sesión.");
          router.replace("/auth/login");
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/changas/contratante`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setChangas(response.data); // el backend devuelve un array de changas
      } catch (error: any) {
        console.error("Error al obtener changas del contratante:", error.response?.data || error.message);
        Alert.alert("Error", "No se pudieron cargar tus changas activas.");
      } finally {
        setLoading(false);
      }
    };

    fetchChangasByContratante();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con saludo y avatar */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>¡Hola María!</Text>
                <HelloWave />
              </View>
              <Text style={styles.subtitle}>Gestiona tus changas</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          </View>
          {/* REFACTOR: Botón "Crear Nueva Changa" */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.createCard}
            onPress={() => router.push("/changas/nueva" as any)}
          >
            <Text style={styles.createTitle}>+ Crear Nueva Changa</Text>
            <Text style={styles.createSubtitle}>
              Publica tu trabajo y encuentra ayuda
            </Text>
          </TouchableOpacity>
          {/* REFACTOR: Acciones Rápidas (3 columnas) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  onPress={() => router.push(action.route as any)}
                >
                  <Ionicons name={action.icon} size={24} color={palette.tint} />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDesc}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* REFACTOR: Lista de changas activas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Changas Activas</Text>
            <TouchableOpacity onPress={() => router.push("/changas/mis" as any)}>
              <Text style={styles.linkText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardList}>
            {loading ? (
              <ActivityIndicator size="large" color={palette.tint} />
            ) : changas.length === 0 ? (
              <Text style={styles.emptyText}>No tenés changas activas.</Text>
            ) : (
              changas.map((changa) => {
                const isInProgress = changa.estado === "En progreso";
                return (
                  <TouchableOpacity
                    key={changa.id || changa.changaID || Math.random().toString()}
                    style={styles.card}
                    onPress={() =>
                      router.push({
                        pathname: "/changas/[id]",
                        params: { id: changa.id, viewMode: "contratante" },
                      })
                    }
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconWrapper}>
                        <Ionicons name="briefcase-outline" size={22} color={palette.tint} />
                      </View>
                      <View style={styles.cardHeaderText}>
                        <Text style={styles.cardTitle}>{changa.titulo}</Text>
                        <Text style={styles.cardDescription}>
                          {changa.descripcion}
                        </Text>
                      </View>
                      {changa.postulantes ? (
                        <View style={styles.badgeOpen}>
                          <Text style={styles.badgeTextOpen}>
                            {changa.postulantes} postulantes
                          </Text>
                        </View>
                      ) : null}
                      {isInProgress ? (
                        <View style={styles.badgeProgress}>
                          <Text style={styles.badgeTextProgress}>
                            {changa.estado}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.cardFooter}>
                      <View style={styles.metaRow}>
                        <Ionicons name="cash-outline" size={16} color={palette.muted} />
                        <Text style={styles.metaText}>${changa.remuneracion}</Text>

                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={palette.muted}
                          style={{ marginLeft: SPACING.sm }}
                        />
                        <Text style={styles.metaText}>
                          {new Date(changa.horaInicio).toLocaleDateString()}
                        </Text>
                      </View>

                      <Text style={styles.metaText}>
                        {changa.estado || "Sin estado"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* REFACTOR: Resumen mensual */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.sectionTitle}>Resumen del mes</Text>
              <Ionicons name="stats-chart" size={20} color={palette.tint} />
            </View>
            <View style={styles.summaryRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={palette.icon}
              />
              <Text style={styles.metaText}>
                {summaryData.completadas} changas completadas
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="star-outline" size={16} color={palette.icon} />
              <Text style={styles.metaText}>
                Calificación promedio: {summaryData.calificacion}
              </Text>
            </View>
          </View>
        </ScrollView>
        {/* AÑADIDO: Barra de navegación (copiada de trabajador.tsx) */}
        <View style={styles.bottomNav}>
          {quickLinks.map((item) => {
            const routePath =
              typeof item.route === "string"
                ? item.route
                : (item.route as any)?.pathname ?? String(item.route);
            const isHomeActive =
              item.id === "home" &&
              (pathname === "/home/trabajador" ||
                pathname.startsWith("/home/contratante"));
            const isActive =
              isHomeActive ||
              (item.id !== "home" &&
                (pathname === routePath || pathname.startsWith(`${routePath}/`)));
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => {
                    if (item.id === 'perfil') {
                        goToProfile();
                        return;
                    }
                    // SI es el botón de Chats...
                    if (item.id === 'chats') {
                        // Navegamos a /chats y enviamos la ruta de regreso
                        router.push({
                            pathname: '/chats',
                            params: { returnHome: '/home/contratante' } // <-- Parámetro clave
                        });
                    }
                    // SI es el botón de Home...
                    else if (item.id === 'home') {
                        // ¡CAMBIO! Simplemente retrocedemos
                        router.back();
                    }
                    // PARA CUALQUIER OTRO BOTÓN...
                    else {
                        // Usamos la ruta definida en quickLinks
                        router.push(item.route);
                    }
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? palette.tint : palette.icon}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.title}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  // --- Layout (Copiado de trabajador.tsx) ---
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.lg * 6, // Aumentamos padding inferior
  },
  // --- Header (Tu código original) ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerText: { flex: 1, marginRight: SPACING.md },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  greeting: {
    fontSize: FONT.lg, 
    fontWeight: "700" as const,
    color: palette.icon,
  },
  subtitle: { marginTop: 4, fontSize: FONT.md, color: palette.muted },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.tint,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: FONT.lg,
    fontWeight: "700" as const,
    color: palette.tint,
  },
  // --- REFACTOR: Card crear changa ---
  createCard: {
    backgroundColor: palette.tint,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg, 
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createTitle: {
    fontSize: FONT.lg,
    fontWeight: "700" as const,
    color: palette.white,
    marginBottom: 4,
  },
  createSubtitle: {
    fontSize: FONT.md,
    color: "rgba(255,255,255,0.85)",
  },
  // --- Títulos de Sección ---
  sectionContainer: {
    marginTop: SPACING.lg, 
  },
  sectionHeader: {
    marginTop: SPACING.lg, 
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: "700" as const,
    color: palette.icon,
  },
  linkText: {
    color: palette.tint,
    fontWeight: "600" as const,
  },
  // --- REFACTOR: Quick actions ---
  quickActionsGrid: {
    marginTop: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: "31.5%", // Ajustado para 3 columnas con espacio
    borderRadius: RADIUS.lg,
    backgroundColor: palette.tabIconSelected, // Color celeste claro
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  quickActionTitle: {
    fontSize: FONT.md,
    fontWeight: "600" as const,
    color: palette.icon,
  },
  quickActionDesc: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginTop: 2,
  },
  // --- REFACTOR: Card changa activa ---
  cardList: { gap: SPACING.md },
  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontSize: FONT.lg,
    fontWeight: "700" as const,
    color: palette.icon,
  },
  cardDescription: {
    marginTop: 2,
    fontSize: FONT.md,
    color: palette.muted,
  },
  badgeOpen: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: palette.tint, // Verde
  },

  badgeTextOpen: {
    color: palette.white,
    fontSize: FONT.sm,
    fontWeight: "600" as const,
  },
  badgeProgress: { 
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#FFA000", // Naranja (ejemplo 'En progreso')
  },
  badgeTextProgress: {
    color: palette.white,
    fontSize: FONT.sm,
    fontWeight: "600" as const,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: SPACING.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  metaTextBold: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: "600" as const,
  },
  // --- REFACTOR: Resumen mensual ---
  summaryCard: {
    marginTop: SPACING.lg,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: SPACING.sm, 
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Alinea título e ícono
    gap: SPACING.sm,
  },
  // --- Estilos de Bottom Nav (Copiados 1:1 de trabajador.tsx) ---
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: palette.white, 
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  navItemActive: {
    position: "relative",
  },
  navText: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  navTextActive: {
    color: palette.tint,
    fontWeight: "600" as const,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.tint,
  },
  emptyText: {
    textAlign: "center",
    color: palette.muted,
    fontSize: FONT.md,
    marginVertical: SPACING.lg,
  },
});