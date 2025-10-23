import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { HelloWave } from "../../components/hello-wave";
import theme from "../../constants/theme";
import { useProfileNavigation } from "../../hooks/use-profile-navigation";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

type JobVariant = "primary" | "secondary";

// Navegación inferior rápida
const quickLinks: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}[] = [
  { id: "home", title: "Home", icon: "home-outline" as const, route: "/home/trabajador" as Href },
  {
    id: "chats",
    title: "Chats",
    icon: "chatbubble-ellipses-outline" as const,
    route: "/chats" as Href,
  },
  {
    id: "mis-changas",
    title: "Favoritas",
    icon: "heart-outline" as const,
    route: "/changas/favoritas" as Href,
  },
  {
    id: "perfil",
    title: "Perfil",
    icon: "person-circle-outline" as const,
    route: "/perfil" as Href,
  },
];
export default function InicioTrabajadorScreen() {
  
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [changas, setChangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChangasIniciadas = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          Alert.alert("Sesión expirada", "Iniciá sesión nuevamente.");
          router.replace("/auth/login");
          return;
        }

        const response = await axios.get(
          "http://192.168.0.194:3000/api/changas/iniciadas",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setChangas(response.data); // el backend debería devolver un array
      } catch (error: any) {
        console.error("Error al obtener changas:", error.response?.data || error.message);
        Alert.alert("Error", "No se pudieron cargar las changas disponibles.");
      } finally {
        setLoading(false);
      }
    };

    fetchChangasIniciadas();
  }, []);


  const { goToProfile, currentUser } = useProfileNavigation();

  // Calculamos iniciales desde el nombre real (ej. María Rodríguez)
  const initials = useMemo(() => {
  if (!currentUser?.name) return "?";
  return currentUser.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}, [currentUser?.name]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>¡Hola {currentUser.name.split(" ")[0]}!
              </Text>
                 <HelloWave />
        </View>
    <Text style={styles.subtitle}>Encuentra tu próxima changa</Text>
  </View>

  <TouchableOpacity
    style={styles.avatar}
    onPress={() => goToProfile(currentUser.id)} // Tocar avatar abre el perfil
  >
    <Text style={styles.avatarInitial}>{initials}</Text>
  </TouchableOpacity>
</View>

          {/* Barra de búsqueda */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color={palette.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar changas..."
              placeholderTextColor={palette.muted}
              style={styles.searchField}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => router.push("/changas" as any)}
            >
              <Ionicons name="funnel-outline" size={18} color={palette.white} />
            </TouchableOpacity>
          </View>

          {/* Changas cercanas */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Changas Cerca Tuyo</Text>
              <Text style={styles.sectionSubtitle}>Basadas en tu ubicación actual</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/changas" as any)}>
              <Text style={styles.linkText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardList}>
            {loading ? (
              <ActivityIndicator size="large" color={palette.tint} />
            ) : changas.length === 0 ? (
              <Text style={styles.emptyText}>No hay changas iniciadas disponibles.</Text>
            ) : (
              changas.map((changa) => (
                <TouchableOpacity
                  key={changa.changaID}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/changas/[id]",
                      params: { id: changa.changaID, viewMode: "trabajador" },
                    })
                  }
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons name="construct-outline" size={22} color={palette.tint} />
                    </View>

                    <View style={styles.cardInfo}>
                      {/* Header de la card */}
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{changa.titulo}</Text>
                        <TouchableOpacity style={styles.favoriteButton}>
                          <Ionicons name="heart-outline" size={20} color={palette.tint} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.cardDescription}>{changa.descripcion}</Text>

                      {/* Chips */}
                      <View style={styles.chipRow}>
                        <View style={styles.infoChip}>
                          <Ionicons name="time-outline" size={14} color={palette.tint} />
                          <Text style={styles.infoChipText}>
                            {new Date(changa.horaInicio).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.infoChip}>
                          <Ionicons name="cash-outline" size={14} color={palette.tint} />
                          <Text style={styles.infoChipText}>${changa.remuneracion}</Text>
                        </View>
                      </View>

                      {/* Footer */}
                      <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.cardAction}>
                          <Text style={styles.cardActionText}>Ver detalles</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {quickLinks.map((item) => {
            const routePath =
              typeof item.route === "string"
                ? item.route
                : (item.route as any)?.pathname ?? String(item.route);
            const isActive =
              pathname === routePath || pathname.startsWith(`${routePath}/`);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => {
                  if (item.id === "perfil") {
                    goToProfile();
                    return;
                  }

                  router.push(item.route);
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

/* =====================
   Estilos
   ===================== */
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: palette.background 
  },

  container: { flex: 1 },
  scroll: { flex: 1 },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg * 4,
  },

  /* ---------- Header ---------- */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  headerText: { flex: 1, marginRight: SPACING.md },

  greetingRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },

  greeting: { fontSize: FONT.xl, fontWeight: "700" as const, color: palette.icon },

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

  avatarInitial: { fontSize: FONT.lg, fontWeight: "700" as const, color: palette.tint },

  /* ---------- Search ---------- */
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },

  searchField: { flex: 1, fontSize: FONT.md, color: palette.icon },

  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.tint,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------- Section headers ---------- */
  sectionHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: { fontSize: FONT.lg, fontWeight: "700" as const, color: palette.icon },

  sectionSubtitle: { marginTop: 4, fontSize: FONT.sm, color: palette.muted },

  linkText: { color: palette.tint, fontWeight: "600" as const },

  /* ---------- Cards ---------- */
  cardList: { gap: SPACING.md },

  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardContent: { flexDirection: "row", gap: SPACING.md },

  cardIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: { flex: 1 },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  favoriteButton: { padding: 4 },

  cardTitle: { fontSize: FONT.lg, fontWeight: "700" as const, color: palette.icon },

  cardDescription: { marginTop: 4, fontSize: FONT.md, color: palette.muted },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },

  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    gap: 6,
  },

  infoChipText: { fontSize: FONT.sm, color: palette.icon },

  cardFooter: {
    marginTop: SPACING.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rating: { fontSize: FONT.sm, color: palette.muted },

  cardAction: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: palette.tint,
  },

  cardActionSecondary: { backgroundColor: palette.icon },

  cardActionText: { fontSize: FONT.sm, fontWeight: "700" as const, color: palette.white },

  cardActionTextSecondary: { color: palette.white },

  emptyText: {
    textAlign: "center",
    color: palette.muted,
    fontSize: FONT.md,
    marginVertical: SPACING.lg,
  },

  /* ---------- Bottom nav ---------- */
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

  navItem: { alignItems: "center", gap: 4, flex: 1, paddingVertical: SPACING.xs },

  navItemActive: { position: "relative" },

  navText: { fontSize: FONT.sm, color: palette.muted },

  navTextActive: { color: palette.tint, fontWeight: "600" as const },

  activeIndicator: {
    position: "absolute",
    bottom: -SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.tint,
  },
});

