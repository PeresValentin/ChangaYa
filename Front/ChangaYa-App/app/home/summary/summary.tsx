import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useMemo, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import theme from "../../../constants/theme";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

const monthlySnapshot = {
  completed: 12,
  ongoing: 3,
  goal: 20,
  totalPaid: "$45.500",
  satisfaction: 4.9,
};

const highlights = [
  {
    id: "most-hired",
    title: "Trabajador más contratado",
    description: "Laura P. fue contratada 3 veces este mes",
    icon: "star" as const,
    route: "/trabajadores/frecuentes",
  },
  {
    id: "peak-day",
    title: "Día con más actividad",
    description: "Los jueves concentran el 40% de tus changas",
    icon: "calendar" as const,
    route: "/estadisticas/actividad",
  },
];

const weeklyHoursData = [
  { label: "Sem 1", value: 10 },
  { label: "Sem 2", value: 14 },
  { label: "Sem 3", value: 8 },
  { label: "Sem 4", value: 12 },
];

type HighlightCardProps = (typeof highlights)[number];

type Metric = {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const metrics: Metric[] = [
  {
    id: "completed",
    title: "Changas completadas",
    value: String(monthlySnapshot.completed),
    description: "+20% vs mes anterior",
    icon: "checkmark-done-circle-outline",
    route: "/changas/mis",
  },
  {
    id: "ongoing",
    title: "En curso",
    value: String(monthlySnapshot.ongoing),
    description: "Pendientes de aprobación",
    icon: "time-outline",
    route: "/changas/en-curso",
  },
  {
    id: "paid",
    title: "Monto total abonado",
    value: monthlySnapshot.totalPaid,
    description: "Pagos realizados este mes",
    icon: "card-outline",
    route: "/finanzas",
  },
  {
    id: "satisfaction",
    title: "Satisfacción",
    value: `${monthlySnapshot.satisfaction}/5`,
    description: "Basado en reseñas de trabajadores",
    icon: "happy-outline",
    route: "/reseñas",
  },
];

const SummaryMetricCard = memo(
  ({ title, value, description, icon, route }: Metric) => {
    const router = useRouter();
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.metricCard}
        onPress={() => router.push(route as any)}
      >
        <View style={styles.metricHeader}>
          <View style={styles.metricIcon}>
            <Ionicons name={icon} size={22} color={palette.tint} />
          </View>
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricDescription}>{description}</Text>
      </TouchableOpacity>
    );
  }
);
SummaryMetricCard.displayName = "SummaryMetricCard";

const HighlightCard = memo(({ title, description, icon, route }: HighlightCardProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.highlightCard}
      activeOpacity={0.85}
      onPress={() => router.push(route as any)}
    >
      <View style={styles.highlightIconWrapper}>
        <Ionicons name={icon} size={20} color={palette.icon} />
      </View>
      <View style={styles.highlightTextWrapper}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
});
HighlightCard.displayName = "HighlightCard";

// Animación de gráfico de barras: horas contratadas
const WeeklyHoursBars = memo(() => {
  const animatedValues = weeklyHoursData.map(() => new Animated.Value(0));
  const maxValue = useMemo(() => Math.max(...weeklyHoursData.map((i) => i.value)), []);

  useEffect(() => {
    Animated.stagger(
      150,
      animatedValues.map((anim, i) =>
        Animated.timing(anim, {
          toValue: (weeklyHoursData[i].value / maxValue) * 120,
          duration: 700,
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Horas contratadas por semana</Text>
        <Ionicons name="bar-chart-outline" size={22} color={palette.icon} />
      </View>
      <View style={styles.chartContent}>
        {weeklyHoursData.map((item, i) => (
          <View key={item.label} style={styles.chartColumn}>
            <Animated.View
              style={[styles.chartBar, { height: animatedValues[i] }]}
            />
            <Text style={styles.chartLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});
WeeklyHoursBars.displayName = "WeeklyHoursBars";

// Barra de progreso animada
const AnimatedProgressBar = ({ progress }: { progress: number }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress * 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressFill, { width: widthInterpolated }]} />
    </View>
  );
};

export default function SummaryScreen() {
  const router = useRouter();
  const progress =
    (monthlySnapshot.completed + monthlySnapshot.ongoing) /
    monthlySnapshot.goal;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Resumen del Mes</Text>
          <Text style={styles.subtitle}>
            Seguimiento de tus contrataciones y desempeño.
          </Text>
          <AnimatedProgressBar progress={progress} />
          <Text style={styles.progressLabel}>
            {(progress * 100).toFixed(0)}% del objetivo mensual
          </Text>
        </View>

        {/* Métricas destacadas */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <SummaryMetricCard key={metric.id} {...metric} />
          ))}
        </View>

        {/* Gráfica: horas contratadas */}
        <WeeklyHoursBars />

        {/* Destacados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destacados</Text>
          {highlights.map((item) => (
            <HighlightCard key={item.id} {...item} />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => router.push("/changas/mis")}
        >
          <Ionicons name="navigate-outline" size={20} color={palette.white} />
          <Text style={styles.ctaLabel}>Ir a mis changas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  },
  header: {
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONT.xxl,
    fontWeight: "700",
    color: palette.text,
  },
  subtitle: {
    fontSize: FONT.md,
    color: palette.muted,
    lineHeight: 20,
  },
  progressContainer: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.tint,
  },
  progressLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  metricCard: {
    flexBasis: "48%",
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(107,163,104,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  metricTitle: {
    fontSize: FONT.md,
    color: palette.text,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: FONT.xl,
    color: palette.tint,
    fontWeight: "700",
  },
  metricDescription: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  chartCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: FONT.lg,
    color: palette.text,
    fontWeight: "600",
  },
  chartContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  chartColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    gap: SPACING.xs,
  },
  chartBar: {
    width: "80%",
    borderRadius: RADIUS.sm,
    backgroundColor: palette.tint,
  },
  chartLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  section: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: "700",
    color: palette.text,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  highlightIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(97,150,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightTextWrapper: {
    flex: 1,
    gap: SPACING.xs,
  },
  highlightTitle: {
    fontSize: FONT.md,
    fontWeight: "600",
    color: palette.text,
  },
  highlightDescription: {
    fontSize: FONT.sm,
    color: palette.muted,
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: palette.tint,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  ctaLabel: {
    color: palette.white,
    fontSize: FONT.md,
    fontWeight: "600",
  },
});
