import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function LoginScreen() {
  const palette = theme.Colors.light;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Por favor completa ambos campos.");
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.0.194:3000/api/usuarios/login",
        {
          email: email,
          clave: password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user, message } = response.data;

      if (!token || !user) {
        Alert.alert("Error", "Respuesta inesperada del servidor.");
        return;
      }

      // ✅ Guardar el JWT de forma persistente
      await AsyncStorage.setItem("jwtToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));

      console.log("Token guardado:", token);
      console.log("Usuario:", user);

      // 🚀 Redirección según tipoUsuario
      switch (user.tipoUsuario) {
        case "trabajador":
          router.push("/home/trabajador");
          break;
        case "contratante":
          router.push("/home/contratante");
          break;
        case "admin":
          router.push("/auth/welcome");
          break;
        default:
          Alert.alert("Error", "Tipo de usuario desconocido.");
          break;
      }
    } catch (error: any) {
      console.error("Error de login:", error.response?.data || error.message);

      if (error.response?.data?.error === "Contraseña incorrecta") {
        Alert.alert("Credenciales inválidas", "La contraseña es incorrecta.");
      } else if (error.response?.status === 404) {
        Alert.alert("Usuario no encontrado", "Revisa tu email o teléfono.");
      } else {
        Alert.alert("Error de conexión", "No se pudo contactar con el servidor.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar inicial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>C</Text>
      </View>

      {/* Encabezado */}
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>Encuentra tu próxima changa</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={palette.muted}
        />
        {/* AHORA ES UN CONTENEDOR PARA INPUT + ÍCONO */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Contraseña"
            secureTextEntry={!isPasswordVisible} 
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput} 
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
        />

            {/* AÑADIDO: Botón del ojo condicional */}
            {/* Solo se muestra si escribiste algo en la contraseña */}
            {password.length > 0 && (
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
                >
                    <Ionicons 
                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                        size={24} 
                        color={palette.muted}
                    />
                </TouchableOpacity>
            )}
          </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
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

/* =====================
   Estilos
   ===================== */
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

  // 1. Contenedor que imita a 'input' pero permite un ícono adentro
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // Asegura que ocupe el ancho completo
    borderWidth: 1,
    borderColor: "#bbb", // Mismos estilos que 'input'
    borderRadius: RADIUS.md,
    backgroundColor: palette.white,
  },

  // 2. El TextInput de la contraseña (sin bordes, flexible)
  passwordInput: {
    flex: 1, // Ocupa todo el espacio menos el ícono
    paddingVertical: 12, // Mismos paddings que 'input'
    paddingHorizontal: 14,
    fontSize: FONT.md,
    color: palette.text,
  },

  // 3. El botón del ojo
  eyeButton: {
    padding: 14, // Un área de toque cómoda (similar al padding del input)
  },

  /* ---------- Avatar ---------- */
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

  /* ---------- Encabezado ---------- */
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

  /* ---------- Formulario ---------- */
  form: {
    width: "100%",
    gap: 12,
    marginBottom: SPACING.md,
  },

  input: {
    borderWidth: 1,
    borderColor: "#bbb", // 👈 convendría usar palette.border para consistencia
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

  /* ---------- Toggle de rol ---------- */
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

  /* ---------- Botón principal ---------- */
  btnWrapper: {
    marginTop: SPACING.md,
    borderRadius: 50,
    width: "100%",
    alignSelf: "center",
  },

  /* ---------- Separador ---------- */
  separator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: SPACING.md,
    width: "100%",
  },

  line: { 
    flex: 1, 
    height: 1, 
    backgroundColor: "#ddd" 
  },

  separatorText: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginHorizontal: 8,
  },

  /* ---------- Botón Google ---------- */
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

  googleIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 8 
  },

  googleText: { 
    fontSize: FONT.md, 
    color: palette.icon 
  },

  /* ---------- Footer ---------- */
  footer: { 
    marginTop: 10, 
    alignItems: "center" 
  },

  footerTxt: { 
    color: palette.muted, 
    marginBottom: 4 
  },

  link: { 
    color: palette.tint, 
    fontWeight: "700" as const 
  },
});
