import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { HelloWave } from "../../components/hello-wave";
import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

type JobVariant = "primary" | "secondary";

const nearbyJobs = [
  {
    id: "plomero",
    title: "Plomero",
    description: "Reparación de caño roto",
    distance: "A 1.2 km",
    schedule: "Para hoy",
    price: "$8.000",
    rating: "⭐️ 4.8 (23 reseñas)",
    icon: "construct-outline" as const,
    actionLabel: "Postular",
    variant: "primary" as JobVariant,
  },
  {
    id: "limpieza",
    title: "Limpieza",
    description: "Limpieza profunda casa",
    distance: "A 2.1 km",
    schedule: "Para mañana",
    price: "$6.500",
    rating: "⭐️ 4.5 (15 reseñas)",
    icon: "sparkles-outline" as const,
    actionLabel: "Postular",
    variant: "primary" as JobVariant,
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Entrega de paquetes zona centro",
    distance: "A 1 km",
    schedule: "Para hoy",
    price: "$5.200",
    rating: "⭐️ 4.9 (45 reseñas)",
    icon: "bicycle-outline" as const,
    actionLabel: "Saber más",
    variant: "secondary" as JobVariant,
  },
];

const quickLinks = [
  { id: "home", title: "Home", icon: "home-outline" as const, route: "/home/trabajador" },
  { id: "chats", title: "Chats", icon: "chatbubble-ellipses-outline" as const, route: "/chats" },
  { id: "mis-changas", title: "Mis Changas", icon: "briefcase-outline" as const, route: "/changas" },
  { id: "perfil", title: "Perfil", icon: "person-circle-outline" as const, route: "/profile" },
];

export default function InicioTrabajadorScreen() {
  const router = useRouter();
  const initials = useMemo(() => "Juan".charAt(0), []);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>¡Hola Juan!</Text>
                <HelloWave />
              </View>
              <Text style={styles.subtitle}>Encuentra tu próxima changa</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          </View>

          {/* Buscar */}
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

          {/* Lista de changas */}
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
            {nearbyJobs.map((job) => (
              <View key={job.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardIconWrapper}>
                    <Ionicons name={job.icon} size={22} color={palette.tint} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{job.title}</Text>
                      <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart-outline" size={20} color={palette.tint} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardDescription}>{job.description}</Text>

                    <View style={styles.chipRow}>
                      <View style={styles.infoChip}>
                        <Ionicons name="location-outline" size={14} color={palette.tint} />
                        <Text style={styles.infoChipText}>{job.distance}</Text>
                      </View>
                      <View style={styles.infoChip}>
                        <Ionicons name="time-outline" size={14} color={palette.tint} />
                        <Text style={styles.infoChipText}>{job.schedule}</Text>
                      </View>
                      <View style={styles.infoChip}>
                        <Ionicons name="cash-outline" size={14} color={palette.tint} />
                        <Text style={styles.infoChipText}>{job.price}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.rating}>{job.rating}</Text>
                      <TouchableOpacity
                        style={[
                          styles.cardAction,
                          job.variant === "secondary" && styles.cardActionSecondary,
                        ]}
                        onPress={() =>
                          router.push({ pathname: "/changas/[id]", params: { id: job.id } })
                        }
                      >
                        <Text
                          style={[
                            styles.cardActionText,
                            job.variant === "secondary" && styles.cardActionTextSecondary,
                          ]}
                        >
                          {job.actionLabel}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Accesos rápidos */}
        <View style={styles.bottomNav}>
          {quickLinks.map((item) => {
            const isActive = item.id === "home";
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.route as any)}
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
  safeArea: { flex: 1, backgroundColor: palette.background },

  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg * 4,
  },

  // Header
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

  // Search
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

  // Section headers
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

  // Cards
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

  // Bottom nav
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
