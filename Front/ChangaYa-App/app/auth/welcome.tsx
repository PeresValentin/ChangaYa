import { View, Text, StyleSheet, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRouter } from "expo-router";


import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function WelcomeScreen() {
  const palette = theme.Colors.light;
   const router = useRouter();   

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Hero + tarjeta como bloque compacto */}
      <View style={styles.card}>
        {/* Imagen superior */}
        <Image
          source={require("../../assets/images/welcome_logo.png")}
          style={styles.heroImage}
        />


        {/* Títulos */}
        <Text style={styles.titleLine1}>Tu próxima changa</Text>
        <Text style={styles.titleLine2}>Más cerca de lo que creés</Text>

        <Text style={styles.subtitle}>
          Conectamos trabajadores con oportunidades cerca tuyo de manera rápida y segura
        </Text>

        {/* Bullets */}
        <View style={styles.bullets}>
          <Bullet text="Changas cerca tuyo" color={palette.tint} />
          <Bullet text="Opiniones de la comunidad" color={palette.icon} />
          <Bullet text="Oportunidades reales y confiables" color={palette.text} />
        </View>

        {/* Botón */}
        <PrimaryButton
          title="¡Empezar Ahora!"
          onPress={() => router.push("/auth/register")}  
          style={styles.btnWrapper}
        />

        {/* Footer */}
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

function Bullet({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="checkmark-circle" size={20} color={color} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const { Colors, RADIUS, SPACING, FONT } = theme;
const palette = Colors.light;

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: palette.tabIconSelected,  
  justifyContent: "center",
  alignItems: "center",
  padding: SPACING.lg,
},
  card: {
    backgroundColor: palette.tabIconSelected,
    borderRadius: 10,
    padding: SPACING.lg,
    shadowColor: "transparent",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    width: "100%",
    height: "100%",
    maxWidth: 400,      
    alignItems: "center",
  },
  heroImage: {
    width: 420,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  titleLine1: {
    fontSize: FONT.xl,
    fontWeight: "700" as const,
    color: palette.icon,
    textAlign: "center" as const,
  },
  titleLine2: {
    fontSize: FONT.xl,
    fontWeight: "900" as const,
    color: palette.tint,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT.md,
    color: palette.muted,
    textAlign: "center" as const,
    marginBottom: 50,
  },
  bullets: { 
    backgroundColor: palette.white,
    borderRadius: 10,
    padding: 15,
    gap: 10, 
    marginBottom: 40, 
    width: "110%" 
  },
  bulletRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  bulletText: { color: palette.text, fontSize: FONT.lg, fontWeight: "700" as const },
  btnWrapper: {
  marginTop: SPACING.md,
  width: "100%",      // ocupa todo el ancho de la tarjeta
  borderRadius: 50,   // ovalado
},

  footer: {
    marginTop: 14,
    alignItems: "center",
  },
  footerTxt: {
    color: palette.muted,
    marginBottom: 4,
  },
  link: { color: palette.tint, fontWeight: "700" as const },
});
