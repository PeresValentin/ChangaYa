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

const weeklyChangasData = [
  { label: "Sem 1", value: 3 },
  { label: "Sem 2", value: 4 },
  { label: "Sem 3", value: 2 },
  { label: "Sem 4", value: 3 },
];

const metrics = [
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
    route: "/changas/mis",
  },
  {
    id: "paid",
    title: "Monto total abonado",
    value: monthlySnapshot.totalPaid,
    description: "Pagos realizados este mes",
    icon: "card-outline",
    route: "/changas/mis",
  },
  {
    id: "satisfaction",
    title: "Satisfacción",
    value: `${monthlySnapshot.satisfaction}/5`,
    description: "Basado en reseñas",
    icon: "happy-outline",
    route: "/changas/mis",
  },
];

const SummaryMetricCard = memo((props: any) => {
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
        {weeklyChangasData.map((item, i) => (
          <View key={item.label} style={styles.chartColumn}>
            <Animated.View
              style={[
                styles.chartBar,
                {
                  height: animatedValues[i],
                  backgroundColor: palette.tint,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={styles.chartValueInside}>{item.value}</Text>
            </Animated.View>
            <Text style={styles.chartLabel}>{item.label}</Text>
          </View>
        ))}
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

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <SummaryMetricCard key={m.id} {...m} />
          ))}
        </View>

        <WeeklyChangasBars />

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
