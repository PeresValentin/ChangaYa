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

import { HelloWave } from "../../components/hello-wave";
import theme from "../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// Acciones rápidas que el usuario puede crear con un clic
const quickActions = [
  {
    id: "plomeria",
    title: "Plomería",
    icon: "water-outline" as const,
    route: "/changas/nueva?categoria=plomeria",
    description: "Soluciona fugas y arreglos",
  },
  {
    id: "limpieza",
    title: "Limpieza",
    icon: "sparkles-outline" as const,
    route: "/changas/nueva?categoria=limpieza",
    description: "Deja tu hogar impecable",
  },
  {
    id: "hogar",
    title: "Hogar",
    icon: "home-outline" as const,
    route: "/changas/nueva?categoria=hogar",
    description: "Reparaciones y mantenimiento",
  },
  {
    id: "envios",
    title: "Delivery",
    icon: "bicycle-outline" as const,
    route: "/changas/nueva?categoria=envios",
    description: "Recibe envíos al instante",
  },
];

// Lista de changas activas (mock hardcodeado)
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

  // Inicial para el avatar (ejemplo: primera letra del nombre del usuario)
  const initials = useMemo(() => "María".charAt(0), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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

        {/* Botón destacado para crear nueva changa */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.createCard}
          onPress={() => router.push("/changas/nueva" as any)}
        >
          <View style={styles.createIconWrapper}>
            <Ionicons name="add" size={24} color={palette.tint} />
          </View>

          <View style={styles.createCopy}>
            <Text style={styles.createTitle}>Crear Nueva Changa</Text>
            <Text style={styles.createSubtitle}>
              Publica tu trabajo y encuentra ayuda
            </Text>
          </View>

          <View style={styles.createArrow}>
            <Ionicons name="chevron-forward" size={20} color={palette.tint} />
          </View>
        </TouchableOpacity>

        {/* Accesos rápidos a categorías */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={22} color={palette.tint} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
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
          {activeJobs.map((job) => {
            const isInProgress = job.status === "En progreso";

            return (
              <View key={job.id} style={styles.card}>
                {/* Cabecera de la card con icono, título y estado */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardIconWrapper}>
                      <Ionicons name={job.icon} size={22} color={palette.tint} />
                    </View>

                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>{job.title}</Text>
                      <Text style={styles.cardDescription}>{job.description}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isInProgress ? styles.statusBadgeProgress : styles.statusBadgeOpen,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isInProgress && styles.statusTextOnDark,
                      ]}
                    >
                      {job.status}
                    </Text>
                  </View>
                </View>

                {/* Chips con fecha límite y precio */}
                <View style={styles.metaPillsRow}>
                  <View style={styles.metaPill}>
                    <Ionicons name="time-outline" size={14} color={palette.tint} />
                    <Text style={styles.metaPillText}>{job.due}</Text>
                  </View>

                  <View style={styles.metaPill}>
                    <Ionicons name="cash-outline" size={14} color={palette.tint} />
                    <Text style={styles.metaPillText}>{job.price}</Text>
                  </View>
                </View>

                {/* Meta info: asignación y calificación */}
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

                {/* Acción de la card */}
                <TouchableOpacity
                  style={styles.cardAction}
                  onPress={() => router.push(`/changas/${job.id}` as any)}
                >
                  <Text style={styles.cardActionText}>{job.actionLabel}</Text>
                  <Ionicons name="chevron-forward" size={18} color={palette.tint} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrapper}>
              <Ionicons name="stats-chart-outline" size={20} color={palette.tint} />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Resumen del mes</Text>
              <Text style={styles.summarySubtitle}>Tu actividad como contratante</Text>
            </View>
          </View>

          <View style={styles.summaryMetrics}>
            <View style={styles.summaryMetricItem}>
              <Ionicons name="checkmark-circle" size={16} color={palette.tint} />
              <Text style={styles.summaryMetricText}>
                <Text style={styles.summaryMetricValue}>8</Text> changas completadas
              </Text>
            </View>

            <View style={styles.summaryMetricItem}>
              <Ionicons name="star" size={16} color={palette.tint} />
              <Text style={styles.summaryMetricText}>Promedio calificación: 4.8</Text>
            </View>
          </View>

          <View style={styles.summaryNextStep}>
            <Ionicons name="notifications-outline" size={18} color={palette.tint} />
            <Text style={styles.summaryNextStepText}>
              Próxima acción: revisa postulaciones nuevas
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
   Estilos de la pantalla
   ===================== */
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: palette.background 
  },

  scrollContent: { 
    padding: SPACING.lg, 
    paddingBottom: SPACING.lg * 2 
  },

  /* ---------- Header ---------- */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  headerText: { 
    flex: 1, 
    marginRight: SPACING.md 
  },

  greetingRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: SPACING.sm 
  },

  greeting: { 
    fontSize: FONT.xl, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },

  subtitle: { 
    marginTop: 4, 
    fontSize: FONT.md, 
    color: palette.muted 
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  avatarInitial: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.tint 
  },

  /* ---------- Card crear changa ---------- */
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.tint,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  createIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  createCopy: { flex: 1 },

  createTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.white 
  },

  createSubtitle: { 
    marginTop: 4, 
    fontSize: FONT.md, 
    color: "rgba(255,255,255,0.85)" 
  },

  createArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------- Quick actions ---------- */
  quickActionsContainer: {
    marginTop: SPACING.lg,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  sectionTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },

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
    paddingHorizontal: SPACING.sm,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: palette.border,
  },

  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionText: { 
    fontSize: FONT.md, 
    fontWeight: "600" as const, 
    color: palette.icon 
  },

  quickActionDescription: { 
    fontSize: FONT.sm, 
    color: palette.muted 
  },

  /* ---------- Sección changas activas ---------- */
  sectionHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  linkText: { 
    color: palette.tint, 
    fontWeight: "600" as const 
  },

  cardList: { gap: SPACING.md },

  card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: SPACING.sm,
  },

  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start" 
  },

  cardHeaderLeft: { 
    flexDirection: "row", 
    gap: SPACING.sm, 
    flex: 1 
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

  statusBadge: { 
    paddingVertical: 4, 
    paddingHorizontal: 12, 
    borderRadius: 999 
  },

  statusBadgeOpen: { 
    backgroundColor: palette.background 
  },

  statusBadgeProgress: { 
    backgroundColor: palette.tint 
  },

  statusText: { 
    fontSize: FONT.sm, 
    fontWeight: "600" as const, 
    color: palette.tint 
  },

  statusTextOnDark: { 
    color: palette.white 
  },

  cardTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },

  cardDescription: { 
    marginTop: 2, 
    fontSize: FONT.md, 
    color: palette.muted 
  },

  metaPillsRow: { 
    flexDirection: "row", 
    gap: SPACING.sm 
  },

  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    backgroundColor: palette.background,
  },

  metaPillText: { 
    fontSize: FONT.sm, 
    fontWeight: "600" as const, 
    color: palette.icon 
  },

  metaRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 
  },

  metaText: { 
    fontSize: FONT.sm, 
    color: palette.icon 
  },

  cardAction: {
    marginTop: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },

  cardActionText: { 
    fontSize: FONT.md, 
    fontWeight: "600" as const, 
    color: palette.tint 
  },

  /* ---------- Resumen mensual ---------- */
  summaryCard: {
    marginTop: SPACING.lg,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: SPACING.md,
  },

  summaryHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: SPACING.sm 
  },

  summaryIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },

  summarySubtitle: { 
    fontSize: FONT.sm, 
    color: palette.muted 
  },

  summaryMetrics: { gap: SPACING.xs },

  summaryMetricItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },

  summaryMetricText: { 
    fontSize: FONT.md, 
    color: palette.icon 
  },

  summaryMetricValue: { 
    fontWeight: "700" as const 
  },

  summaryNextStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: palette.background,
  },

  summaryNextStepText: { 
    fontSize: FONT.sm, 
    color: palette.icon, 
    flex: 1 
  },
});
