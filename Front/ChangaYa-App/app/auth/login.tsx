import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLoading } from "../../hooks/LoadingContext";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";

export default function LoginScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const palette = theme.Colors.light;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  // ANIMACIONES
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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

    // Formulario entra suave
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  // LÓGICA ORIGINAL (NO TOCO NADA)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Por favor completa ambos campos.");
      return;
    }

    showLoading();
    try {
      const response = await axios.post(
        `${API_URL}/api/usuarios/login`,
        { email: email, clave: password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        Alert.alert("Error", "Respuesta inesperada del servidor.");
        return;
      }

      await AsyncStorage.setItem("jwtToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));

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
      }
    } catch (error: any) {
      if (error.response?.data?.error === "Contraseña incorrecta") {
        Alert.alert("Credenciales inválidas", "La contraseña es incorrecta.");
      } else if (error.response?.status === 404) {
        Alert.alert("Usuario no encontrado", "Revisa tu email o teléfono.");
      } else {
        Alert.alert("Error de conexión", "No se pudo contactar con el servidor.");
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* FONDOS PASTEL */}
        <View style={styles.pastelTop} />
        <View style={styles.pastelBottom} />

        {/* HERO */}
        <Animated.View
          style={[styles.heroWrapper, { transform: [{ translateY }] }]}
        >
          <View style={styles.heroGlow} />

          <View style={styles.heroCircle}>
            <Image
              source={require("../../assets/images/hero_changa.png")}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* ENCABEZADO */}
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Accede a tu proxima changa
        </Text>

        {/* FORM CARD */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeInAnim,
              transform: [{ translateY: slideInAnim }],
            },
          ]}
        >
          {/* Input Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={palette.muted} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={palette.muted}
            />
          </View>

          {/* Input Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={palette.muted} />

            <TextInput
              placeholder="Contraseña"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
            />

            {password.length > 0 && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={palette.muted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* BOTÓN LOGIN */}
          <PrimaryButton
            title="INICIAR SESIÓN"
            onPress={handleLogin}
            style={styles.btnWrapper}
          />
        </Animated.View>

        {/* SEPARADOR */}
        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>o continúa con</Text>
          <View style={styles.line} />
        </View>

        {/* GOOGLE */}
        <TouchableOpacity style={styles.googleBtn}>
          <Image
                  source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                  style={styles.googleIcon}
          />
          <Text style={styles.googleText}></Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTxt}>¿No tienes cuenta?</Text>
          <Link href="/auth/register" style={styles.link}>
            Regístrate
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ===================== ESTILOS ===================== */

const { RADIUS, SPACING, FONT } = theme;
const palette = theme.Colors.light;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
  scrollContainer: { flex: 1, backgroundColor: palette.white },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Pastel Background */
  pastelTop: {
    position: "absolute",
    top: -160,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: palette.tint,
    opacity: 0.15,
  },
  pastelBottom: {
    position: "absolute",
    bottom: -160,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: palette.icon,
    opacity: 0.14,
  },

  /* HERO */
  heroWrapper: {
    marginBottom: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: palette.tint,
    opacity: 0.14,
  },
  heroCircle: {
    width: 170,
    height: 170,
    borderRadius: 170,
    overflow: "hidden",
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  /* TITULOS */
  title: {
    fontSize: FONT.xl,
    fontWeight: "800",
    color: palette.icon,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },

  /* FORM CARD */
  formCard: {
    width: "100%",
    backgroundColor: palette.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
    gap: SPACING.md,
  },

  /* Inputs con iconos */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: RADIUS.md,
    backgroundColor: palette.white,
    paddingHorizontal: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FONT.md,
    color: palette.text,
  },
  eyeButton: {
    padding: 8,
  },

  forgotPassword: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "right",
  },

  /* BTN */
  btnWrapper: {
    marginTop: SPACING.sm,
    width: "100%",
    borderRadius: 50,
  },

  /* SEPARADOR */
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.md,
    width: "100%",
  },
  separatorText: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginHorizontal: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },

  /* Google Btn */
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

  /* FOOTER */
  footer: { alignItems: "center" },
  footerTxt: { color: palette.muted, marginBottom: 4 },
  link: { color: palette.tint, fontWeight: "700" },
});
