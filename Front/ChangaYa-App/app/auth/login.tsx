import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function LoginScreen() {
  const palette = theme.Colors.light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"trabajador" | "contratante">("trabajador");
  const router = useRouter();

  // Manejo de navegación según el tipo de usuario
  const handleLogin = () => {
    const destination =
      userType === "trabajador" ? "/home/trabajador" : "/home/contratante";
    router.push(destination as any); // 👈 TS no reconoce la ruta, por eso se castea a any
  };

  return (
    <View style={styles.container}>
      {/* Avatar inicial */}
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

      {/* Selector de rol */}
      <View style={styles.roleToggle}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            userType === "trabajador" && styles.roleOptionActive,
          ]}
          onPress={() => setUserType("trabajador")}
        >
          <Text
            style={[
              styles.roleOptionText,
              userType === "trabajador" && styles.roleOptionTextActive,
            ]}
          >
            Trabajador
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleOption,
            userType === "contratante" && styles.roleOptionActive,
          ]}
          onPress={() => setUserType("contratante")}
        >
          <Text
            style={[
              styles.roleOptionText,
              userType === "contratante" && styles.roleOptionTextActive,
            ]}
          >
            Contratante
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón de login */}
      <PrimaryButton
        title="INICIAR SESIÓN"
        onPress={handleLogin}
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
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
          }}
          style={styles.googleIcon}
        />
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

const { RADIUS, SPACING, FONT } = theme;
const palette = theme.Colors.light;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar superior
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

  // Títulos
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

  // Formulario
  form: {
    width: "100%",
    gap: 12,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb", // 👈 quizás convenga tomarlo del theme para unificar
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

  // Toggle de rol (Trabajador/Contratante)
  roleToggle: {
    flexDirection: "row",
    width: "100%",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: palette.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  roleOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  roleOptionActive: {
    backgroundColor: palette.tint,
    borderColor: palette.tint,
  },
  roleOptionText: {
    fontSize: FONT.md,
    color: palette.muted,
    fontWeight: "600" as const,
  },
  roleOptionTextActive: {
    color: palette.white,
  },

  // Botón principal
  btnWrapper: {
    marginTop: SPACING.md,
    borderRadius: 50,
    width: "100%",
    alignSelf: "center",
  },

  // Separador
  separator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: SPACING.md,
    width: "100%",
  },
  line: { flex: 1, height: 1, backgroundColor: "#ddd" },
  separatorText: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginHorizontal: 8,
  },

  // Botón Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 50,
    paddingVertical: 12,
    width: "100%",
    marginBottom: SPACING.md,
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  googleText: { fontSize: FONT.md, color: palette.icon },

  // Footer
  footer: { marginTop: 10, alignItems: "center" },
  footerTxt: { color: palette.muted, marginBottom: 4 },
  link: { color: palette.tint, fontWeight: "700" as const },
});
