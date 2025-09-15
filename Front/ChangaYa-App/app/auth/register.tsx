import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function RegisterScreen() {
  const palette = theme.Colors.light;
  const [userType, setUserType] = useState<"worker" | "employer">("worker");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={palette.icon} />
      </TouchableOpacity>

      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

      {/* Selector de usuario */}
      <View style={styles.userTypeRow}>
        <TouchableOpacity
          style={[
            styles.userTypeBtn,
            userType === "worker" && styles.userTypeActive,
          ]}
          onPress={() => setUserType("worker")}
        >
          <Text
            style={[
              styles.userTypeText,
              userType === "worker" && styles.userTypeTextActive,
            ]}
          >
            👷 Soy Trabajador
          </Text>
          <Text
            style={[
              styles.userTypeSmall,
              userType === "worker" && styles.userTypeSmallActive,
            ]}
          >
            Busco changas para trabajar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeBtn,
            userType === "employer" && styles.userTypeActive,
          ]}
          onPress={() => setUserType("employer")}
        >
          <Text
            style={[
              styles.userTypeText,
              userType === "employer" && styles.userTypeTextActive,
            ]}
          >
            🏠 Busco Trabajadores
          </Text>
          <Text
            style={[
              styles.userTypeSmall,
              userType === "employer" && styles.userTypeSmallActive,
            ]}
          >
            Necesito contratar servicios
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            placeholder="Nombre"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
          <TextInput
            placeholder="Apellido"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
        </View>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        <TextInput
          placeholder="Teléfono"
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        <TextInput
          placeholder="DNI"
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
      </View>

      {/* Checkboxes */}
      <View style={styles.checkboxRow}>
        <Switch
          value={acceptTerms}
          onValueChange={setAcceptTerms}
          thumbColor={acceptTerms ? palette.tint : "#ccc"}
        />
        <Text style={styles.checkboxText}>
          Acepto los <Text style={styles.link}>términos y condiciones</Text>
        </Text>
      </View>
      <View style={styles.checkboxRow}>
        <Switch
          value={subscribe}
          onValueChange={setSubscribe}
          thumbColor={subscribe ? palette.tint : "#ccc"}
        />
        <Text style={styles.checkboxText}>
          Recibir ofertas y novedades por email
        </Text>
      </View>

      {/* Botón */}
      <PrimaryButton
        title="CREAR CUENTA"
        onPress={() => router.push("/auth/login")}
        style={styles.btnWrapper}
        disabled={!acceptTerms} // Solo habilitado si acepta términos
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTxt}>¿Ya tienes cuenta?</Text>
        <Link href="/auth/login" style={styles.link}>
          Inicia Sesión
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
  },
  backBtn: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT.xxl,
    fontWeight: "800" as const,
    textAlign: "center" as const,
    color: palette.icon,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "center" as const,
    marginBottom: SPACING.lg,
  },
  userTypeRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  userTypeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.icon,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70, // misma altura para ambos
  },
  userTypeActive: {
    backgroundColor: palette.tint, // verde igual al botón principal
    borderColor: palette.tint,
  },
  userTypeText: {
    fontSize: FONT.md,
    color: palette.icon,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  userTypeTextActive: {
    color: palette.white,
  },
  userTypeSmall: {
    fontSize: FONT.lg,
    color: palette.muted,
    textAlign: "center" as const,
  },
  userTypeSmallActive: {
    color: palette.white,
  },
  form: {
    gap: 12,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row" as const,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: FONT.md,
    backgroundColor: palette.white,
    color: palette.text,
  },
  checkboxRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: FONT.sm,
    color: palette.icon,
  },
  btnWrapper: {
    marginTop: SPACING.lg,
    borderRadius: 50,
    width: "100%",
    alignSelf: "center",
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
