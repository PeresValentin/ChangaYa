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

// Acciones rápidas (atajos para crear changas)
const quickActions = [
  { id: "plomeria", title: "Plomería", icon: "water-outline" as const, route: "/changas/nueva?categoria=plomeria" },
  { id: "limpieza", title: "Limpieza", icon: "sparkles-outline" as const, route: "/changas/nueva?categoria=limpieza" },
  { id: "hogar", title: "Hogar", icon: "home-outline" as const, route: "/changas/nueva?categoria=hogar" },
  { id: "envios", title: "Delivery", icon: "bicycle-outline" as const, route: "/changas/nueva?categoria=envios" },
];

// Changas activas (ejemplo hardcodeado)
const activeJobs = [
  {
    id: "plomero-bano",
    title: "Plomero - Baño",
    description: "Reparar canilla que gotea",
    status: "Abierta",
    price: "$8.000",
    due: "Para hoy",
    assigned: "Esperando trabajador",
    icon: "construct-outline" as const,
    actionLabel: "Ver postulantes",
  },
  {
    id: "limpieza-general",
    title: "Limpieza General",
    description: "Casa de 3 ambientes",
    status: "En progreso",
    price: "$6.500",
    due: "Para mañana",
    assigned: "Trabajadora: Ana López",
    rating: "⭐️ 4.9",
    icon: "sparkles-outline" as const,
    actionLabel: "Ver detalles",
  },
];

export default function InicioContratanteScreen() {
  const router = useRouter();
  const initials = useMemo(() => "María".charAt(0), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
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

        {/* Botón crear nueva changa */}
        <PrimaryButton
          title="+ Crear Nueva Changa"
          onPress={() => router.push("/changas/nueva" as any)} // 👈 `as any` para evitar error de TS
          style={styles.createButton}
        />

        {/* Acciones rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)} // 👈 castear a `any` para TS
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={22} color={palette.tint} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de changas activas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus Changas Activas</Text>
          <TouchableOpacity onPress={() => router.push("/changas/mis" as any)}>
            <Text style={styles.linkText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {activeJobs.map((job) => (
            <View key={job.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name={job.icon} size={24} color={palette.tint} />
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    job.status === "En progreso" && styles.statusBadgeProgress,
                  ]}
                >
                  <Text style={styles.statusText}>{job.status}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{job.title}</Text>
              <Text style={styles.cardDescription}>{job.description}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={palette.icon} />
                <Text style={styles.metaText}>{job.due}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="cash-outline" size={16} color={palette.icon} />
                <Text style={styles.metaText}>{job.price}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={16} color={palette.icon} />
                <Text style={styles.metaText}>{job.assigned}</Text>
              </View>
              {job.rating && (
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={16} color={palette.tint} />
                  <Text style={styles.metaText}>{job.rating}</Text>
                </View>
              )}

              <PrimaryButton
                title={job.actionLabel}
                onPress={() => router.push(`/changas/${job.id}` as any)} // 👈 cast necesario
                style={styles.primaryButton}
              />
            </View>
          ))}
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="stats-chart-outline" size={22} color={palette.tint} />
            </View>
            <Text style={styles.summaryTitle}>Resumen del mes</Text>
          </View>
          <Text style={styles.summaryDescription}>
            8 changas completadas · Promedio calificación: 4.8
          </Text>
          <TextField
            editable={false}
            value="Próxima acción: revisa postulaciones nuevas"
            style={styles.summaryField}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.lg * 2 },

  // Header
  header: { flexDirection: "row",
     justifyContent: "space-between",
      alignItems: "center", 
      marginBottom: SPACING.lg },

  headerText: { flex: 1, 
    marginRight: SPACING.md },
    
  greetingRow: { flexDirection: "row", 
    alignItems: "center", 
    gap: SPACING.sm },

  greeting: { fontSize: FONT.xl,
     fontWeight: "700" as const,
      color: palette.icon },

  subtitle: { marginTop: 4,
     fontSize: FONT.md,
      color: palette.muted },

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
  avatarInitial: { fontSize: FONT.lg,
     fontWeight: "700" as const, 
     color: palette.tint },

  // Botón crear
  createButton: { borderRadius: RADIUS.lg },

  // Acciones rápidas
  quickActionsContainer: {
    marginTop: SPACING.lg,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
  },
  sectionTitle: 
  { fontSize: FONT.lg,
     fontWeight: "700" as const,
      color: palette.icon },

  quickActionsGrid: {
    marginTop: SPACING.md,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },

  quickActionCard: {
    width: "48%",
    borderRadius: RADIUS.md,
    backgroundColor: palette.background,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  quickActionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center", justifyContent: "center",
  },
  quickActionText: { 
    fontSize: FONT.md, 
    fontWeight: "600" as const, 
    color: palette.icon },

  // Changas activas
  sectionHeader: { marginTop: 
    SPACING.lg, marginBottom: 
    SPACING.md, flexDirection:
     "row", justifyContent: 
     "space-between",
      alignItems: "center" },

  linkText: { color: palette.tint,
     fontWeight: "600" as const },

  cardList: { gap: SPACING.md },

  card: { backgroundColor: palette.white,
     borderRadius: RADIUS.lg,
      padding: SPACING.md, 
      elevation: 4 },
  cardHeader: { flexDirection: "row", 
    justifyContent: "space-between",
     alignItems: "center", 
     marginBottom: SPACING.sm },
  cardIconWrapper: {
    width: 40, 
    height: 40, borderRadius: 12, 
    backgroundColor:
     palette.tabIconSelected,
    alignItems: "center",
     justifyContent: "center",
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, backgroundColor: palette.background },
  statusBadgeProgress: { backgroundColor: palette.tabIconSelected },
  statusText: { fontSize: FONT.sm, fontWeight: "600" as const, color: palette.icon },
  cardTitle: { fontSize: FONT.lg, fontWeight: "700" as const, color: palette.icon },
  cardDescription: { marginTop: 4, fontSize: FONT.md, color: palette.muted },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  metaText: { fontSize: FONT.sm, color: palette.icon },
  primaryButton: { marginTop: SPACING.md },

  // Resumen
  summaryCard: { marginTop: SPACING.lg, backgroundColor: palette.white, borderRadius: RADIUS.lg, padding: SPACING.md, elevation: 4 },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  summaryIconWrapper: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: palette.tabIconSelected,
    alignItems: "center", justifyContent: "center",
  },
  summaryTitle: { fontSize: FONT.lg, fontWeight: "700" as const, color: palette.icon },
  summaryDescription: { marginTop: SPACING.sm, fontSize: FONT.md, color: palette.muted },
  summaryField: { marginTop: SPACING.md, backgroundColor: palette.background },
});
