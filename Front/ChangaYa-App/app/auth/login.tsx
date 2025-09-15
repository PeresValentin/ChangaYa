import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function LoginScreen() {
  const palette = theme.Colors.light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>C</Text>
      </View>

      {/* Títulos */}
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>Encuentra tu próxima changa</Text>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email o teléfono"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      {/* Botón login */}
      <PrimaryButton
        title="INICIAR SESIÓN"
        onPress={() => alert("Sesión iniciada")}
        style={styles.btnWrapper}
      />

      {/* Separador */}
      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>o continúa con</Text>
        <View style={styles.line} />
      </View>

      {/* Botón Google */}
      <TouchableOpacity style={styles.googleBtn}>
        <Text style={styles.googleText}>Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTxt}>¿No tienes cuenta?</Text>
        <Link href="/auth/register" style={styles.link}>
          Regístrate
        </Link>
      </View>
    </View>
  );
}

const { Colors, RADIUS, SPACING, FONT } = theme;
const palette = Colors.light;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: FONT.xl,
    fontWeight: "700" as const,
    color: palette.white,
  },
  title: {
    fontSize: FONT.xl,
    fontWeight: "800" as const,
    color: palette.icon,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "center" as const,
    marginBottom: SPACING.lg,
  },
  form: {
    width: "100%",
    gap: 12,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: FONT.md,
    backgroundColor: palette.white,
    color: palette.text,
  },
  forgotPassword: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "right" as const,
    marginTop: 4,
  },
  btnWrapper: {
    marginTop: SPACING.md,
    borderRadius: 50,
    width: "100%",
    alignSelf: "center",
  },
  separator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: SPACING.md,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  separatorText: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginHorizontal: 8,
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  googleText: {
    fontSize: FONT.md,
    color: palette.icon,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerTxt: {
    color: palette.muted,
    marginBottom: 4,
  },
  link: { color: palette.tint, fontWeight: "700" as const },
});
