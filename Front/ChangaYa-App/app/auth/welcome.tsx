import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import type { ComponentProps } from "react";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const palette = theme.Colors.light;

  /** ANIMACIONES **/
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.12)).current;

  useEffect(() => {
    // Hero flotante suave
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow respirando
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.18,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.12,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Interpolación del movimiento flotante
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fondos pastel */}
      <View style={styles.pastelCircleTop} />
      <View style={styles.pastelCircleBottom} />

      <View style={styles.content}>

        {/* HERO con tu imagen + animación */}
        <Animated.View style={[styles.heroWrapper, { transform: [{ translateY }] }]}>
          <Animated.View style={[styles.heroGlow, { opacity: glowAnim }]} />

          <View style={styles.heroCircle}>
  <Image
    source={require("../../assets/images/hero_changa.png")}
    style={styles.heroImage}
    resizeMode="cover"
  />
</View>
        </Animated.View>

        {/* Títulos */}
        <Text style={styles.title1}>Tu próxima changa</Text>
        <Text style={styles.title2}>Más cerca de lo que creés</Text>

        <Text style={styles.subtitle}>
          Conectamos trabajadores y oportunidades reales en tu comunidad.
        </Text>

        {/* Chips */}
        <View style={styles.chipList}>
          <Chip text="Cerca tuyo" icon="location-outline" />
          <Chip text="Opiniones reales" icon="chatbubble-ellipses-outline" />
          <Chip text="Confianza" icon="shield-checkmark-outline" />
        </View>

        {/* CTA */}
        <PrimaryButton
          title="¡Empezar ahora!"
          onPress={() => router.push("/auth/register")}
          style={styles.btnWrapper}
        />

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>¿Ya tienes cuenta?</Text>
          <Link href="/auth/login" style={styles.link}>
            Iniciar Sesión
          </Link>
        </View>

      </View>
    </View>
  );
}

function Chip({
  text,
  icon,
}: {
  text: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}) {
  const palette = theme.Colors.light;
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={18} color={palette.tint} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

const { Colors, SPACING, RADIUS, FONT } = theme;
const palette = Colors.light;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },

  /* Fondos pastel */
  pastelCircleTop: {
    position: "absolute",
    top: -160,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: palette.tint,
    opacity: 0.15,
  },
  pastelCircleBottom: {
    position: "absolute",
    bottom: -160,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: palette.icon,
    opacity: 0.14,
  },

  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.lg,
  },

  /* HERO */
  heroWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: palette.tint,
  },
  heroCircle: {
  width: 220,
  height: 220,
  borderRadius: 220,
  backgroundColor: palette.white,
  
  overflow: "hidden",     // ★ CLAVE: rec orta la imagen dentro del círculo
  
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 4,
},
  heroImage: {
  width: "100%",
  height: "100%",
},

  /* Textos */
  title1: {
    fontSize: FONT.xl,
    fontWeight: "600",
    color: palette.icon,
    textAlign: "center",
  },
  title2: {
    fontSize: FONT.xxl,
    fontWeight: "800",
    color: palette.tint,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT.md,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },

  /* Chips */
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    gap: SPACING.xs,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chipText: {
    color: palette.text,
    fontSize: FONT.sm,
    fontWeight: "600",
  },

  /* CTA */
  btnWrapper: {
    width: "100%",
    borderRadius: 40,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    gap: 6,
  },
  footerTxt: {
    color: palette.muted,
  },
  link: {
    color: palette.tint,
    fontWeight: "700",
  },
});
