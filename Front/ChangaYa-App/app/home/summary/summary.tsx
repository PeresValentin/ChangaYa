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

const weeklyChangasData = [
  { label: "Sem 1", value: 3 },
  { label: "Sem 2", value: 4 },
  { label: "Sem 3", value: 2 },
  { label: "Sem 4", value: 3 },
];

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
    description: "Basado en reseñas",
    icon: "happy-outline",
    route: "/reseñas",
  },
];

const interpolateColor = (value: number, max: number) => {
  const pct = value / max;
  const lerp = (a: number, b: number) => a + (b - a) * pct;

  const r = Math.round(lerp(229, 35));
  const g = Math.round(lerp(245, 132));
  const b = Math.round(lerp(224, 67));

  return `rgb(${r},${g},${b})`;
};

const SummaryMetricCard = memo((props: Metric) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.metricCard}
      onPress={() => router.push(props.route as any)}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricIcon}>
          <Ionicons name={props.icon} size={22} color={palette.tint} />
        </View>
        <Text style={styles.metricTitle}>{props.title}</Text>
      </View>
      <Text style={styles.metricValue}>{props.value}</Text>
      <Text style={styles.metricDescription}>{props.description}</Text>
    </TouchableOpacity>
  );
});
SummaryMetricCard.displayName = "SummaryMetricCard";

type Highlight = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const HighlightCard = memo((props: Highlight) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.highlightCard}
      activeOpacity={0.85}
      onPress={() => router.push(props.route as any)}
    >
      <View style={styles.highlightIconWrapper}>
        <Ionicons name={props.icon} size={20} color={palette.icon} />
      </View>
      <View style={styles.highlightTextWrapper}>
        <Text style={styles.highlightTitle}>{props.title}</Text>
        <Text style={styles.highlightDescription}>{props.description}</Text>
      </View>
    </TouchableOpacity>
  );
});
HighlightCard.displayName = "HighlightCard";

const WeeklyChangasBars = memo(() => {
  const animatedValues = weeklyChangasData.map(() => new Animated.Value(0));
  const maxValue = Math.max(...weeklyChangasData.map((i) => i.value));

  useEffect(() => {
    Animated.stagger(
      150,
      animatedValues.map((anim, i) =>
        Animated.timing(anim, {
          toValue: (weeklyChangasData[i].value / maxValue) * 120,
          duration: 700,
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Changas realizadas por semana</Text>
        <Ionicons name="bar-chart-outline" size={22} color={palette.icon} />
      </View>

      <View style={styles.chartContent}>
        {weeklyChangasData.map((item, i) => {
          const barColor = interpolateColor(item.value, maxValue);
          return (
            <View key={item.label} style={styles.chartColumn}>
              <Animated.View
                style={[
                  styles.chartBar,
                  {
                    height: animatedValues[i],
                    backgroundColor: barColor,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={styles.chartValueInside}>{item.value}</Text>
              </Animated.View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});
WeeklyChangasBars.displayName = "WeeklyChangasBars";

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
        <View style={styles.header}>
          <Text style={styles.title}>Resumen del Mes</Text>
          <Text style={styles.subtitle}>Seguimiento de tus contrataciones.</Text>
          <AnimatedProgressBar progress={progress} />
          <Text style={styles.progressLabel}>
            {(progress * 100).toFixed(0)}% del objetivo mensual
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <SummaryMetricCard key={m.id} {...m} />
          ))}
        </View>

        <WeeklyChangasBars />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destacados</Text>
          {highlights.map((h) => (
            <HighlightCard key={h.id} {...h} />
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
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
  scroll: { flex: 1 },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  header: { gap: SPACING.xs },
  title: {
    fontSize: FONT.xxl,
    fontWeight: "700",
    color: palette.text,
  },
  subtitle: {
    fontSize: FONT.md,
    color: palette.muted,
  },
  progressContainer: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.tint,
  },
  progressLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
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
    fontWeight: "600",
    color: palette.text,
  },
  metricValue: {
    fontSize: FONT.xl,
    fontWeight: "700",
    color: palette.tint,
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
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: FONT.lg,
    fontWeight: "600",
    color: palette.text,
  },
  chartContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
    gap: SPACING.xs,
  },
  chartBar: {
    width: "80%",
    borderRadius: RADIUS.sm,
  },
  chartLabel: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  chartValueInside: {
    color: palette.white,
    fontSize: FONT.md,
    fontWeight: "700",
  },
  section: {
    gap: SPACING.md,
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
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: palette.tint,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  ctaLabel: {
    color: palette.white,
    fontSize: FONT.md,
    fontWeight: "600",
  },
});
