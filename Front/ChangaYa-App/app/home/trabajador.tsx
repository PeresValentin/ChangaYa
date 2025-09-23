import { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import TextField from "../../components/forms/TextField";
import { HelloWave } from "../../components/hello-wave";
import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

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
  },
];

const quickLinks = [
  { id: "chats", title: "Chats", icon: "chatbubble-ellipses-outline" as const, route: "/chats" },
  { id: "mis-changas", title: "Mis Changas", icon: "briefcase-outline" as const, route: "/changas" },
  { id: "perfil", title: "Perfil", icon: "person-circle-outline" as const, route: "/profile" },
];

export default function InicioTrabajadorScreen() {
  const router = useRouter();
  const initials = useMemo(() => "Juan".charAt(0), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
        <TextField
          placeholder="Buscar changas..."
          placeholderTextColor={palette.muted}
          style={styles.searchField}
        />

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
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name={job.icon} size={24} color={palette.tint} />
                </View>
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={22} color={palette.tint} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardTitle}>{job.title}</Text>
              <Text style={styles.cardDescription}>{job.description}</Text>

              <View style={styles.cardDetailRow}>
                <Ionicons name="location-outline" size={16} color={palette.icon} />
                <Text style={styles.cardDetailText}>{job.distance}</Text>
              </View>
              <View style={styles.cardDetailRow}>
                <Ionicons name="time-outline" size={16} color={palette.icon} />
                <Text style={styles.cardDetailText}>{job.schedule}</Text>
              </View>
              <View style={styles.cardDetailRow}>
                <Ionicons name="cash-outline" size={16} color={palette.icon} />
                <Text style={styles.cardDetailText}>{job.price}</Text>
              </View>
              <Text style={styles.rating}>{job.rating}</Text>

              <PrimaryButton
                title={job.actionLabel}
                onPress={() =>
                  router.push({ pathname: "/changas/[id]", params: { id: job.id } })
                }
                style={
                  job.actionLabel === "Saber más"
                    ? styles.secondaryButton
                    : styles.primaryButton
                }
              />
            </View>
          ))}
        </View>

        {/* Accesos rápidos */}
        <View style={styles.bottomNav}>
          {quickLinks.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon} size={22} color={palette.icon} />
              <Text style={styles.navText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },

  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.lg * 2,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  greeting: {
    fontSize: FONT.xl,
    fontWeight: "700" as const,
    color: palette.icon,
  },
  subtitle: {
    marginTop: 4,
    fontSize: FONT.md,
    color: palette.muted,
  },
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

  // Search
  searchField: {
    marginTop: -SPACING.sm,
    backgroundColor: palette.white,
  },

  // Section headers
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
  sectionSubtitle: {
    marginTop: 4,
    fontSize: FONT.sm,
    color: palette.muted,
  },
  linkText: {
    color: palette.tint,
    fontWeight: "600" as const,
  },

  // Cards
  cardList: { gap: SPACING.md },
  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: FONT.lg,
    fontWeight: "700" as const,
    color: palette.icon,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: FONT.md,
    color: palette.muted,
  },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  cardDetailText: {
    fontSize: FONT.sm,
    color: palette.icon,
  },
  rating: {
    marginTop: SPACING.sm,
    fontSize: FONT.sm,
    color: palette.muted,
  },
  primaryButton: {
    marginTop: SPACING.md,
  },
  secondaryButton: {
    marginTop: SPACING.md,
    backgroundColor: palette.icon,
  },

  // Bottom nav
  bottomNav: {
    marginTop: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SPACING.md,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    elevation: 3,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navText: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
});
