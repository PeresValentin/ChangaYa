import { useState, useEffect, useRef} from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import theme from "../../constants/theme";
import axios from "axios";
import { useLoading } from '../../hooks/LoadingContext';

export default function RegisterScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const palette = theme.Colors.light;

  const [userType, setUserType] = useState<"worker" | "employer">("worker");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  /* --- ANIMACIÓN DEL HERO --- */
const scaleAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 1300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1300,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

const animatedHeroStyle = {
  transform: [{ scale: scaleAnim }],
};

  /* --------------------------
     VALIDACIONES (sin tocar)
  ---------------------------*/
  
  const validateFields = () => {
    const trimmedName = name.trim().toLowerCase();
    const trimmedLastname = lastname.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();
    const numericPhone = phone.replace(/\D/g, "");
    const numericDni = dni.replace(/\D/g, "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ÿ\s]{2,}$/;
    const phoneRegex = /^(\+?\d{7,15})$/;
    const dniRegex = /^\d{7,8}$/;

    if (!trimmedName || !nameRegex.test(trimmedName)) {
      Alert.alert("Nombre inválido", "Ingresa un nombre válido.");
      return null;
    }

    if (!trimmedLastname || !nameRegex.test(trimmedLastname)) {
      Alert.alert("Apellido inválido", "Ingresa un apellido válido.");
      return null;
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      Alert.alert("Email inválido", "Ingresa un email correcto.");
      return null;
    }

    if (!numericPhone || !phoneRegex.test(numericPhone)) {
      Alert.alert("Teléfono inválido", "Ingresa un número de teléfono válido.");
      return null;
    }

    if (!numericDni || !dniRegex.test(numericDni)) {
      Alert.alert("DNI inválido", "Ingresa un DNI válido (7 u 8 dígitos).");
      return null;
    }

    if (password.length < 6) {
      Alert.alert("Contraseña muy corta", "Debe tener al menos 6 caracteres.");
      return null;
    }

    if (password !== confirmPassword) {
      Alert.alert("Las contraseñas no coinciden");
      return null;
    }

    if (!acceptTerms) {
      Alert.alert("Debes aceptar los términos y condiciones");
      return null;
    }

    return {
      name: trimmedName,
      lastname: trimmedLastname,
      email: trimmedEmail,
      phone: numericPhone,
      dni: numericDni,
      password,
    };
  };

  const handleRegister = async () => {
    const data = validateFields();
    if (!data) return;

    showLoading();

    try {
      const response = await axios.post(
        `${API_URL}/api/usuarios`,
        {
          nombreUsuario: data.email.split("@")[0],
          clave: data.password,
          nombre: data.name,
          apellido: data.lastname,
          dni: data.dni,
          email: data.email,
          telefono: data.phone,
          tipoUsuario: userType === "worker" ? "trabajador" : "contratante",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Registro exitoso", "Valida tu email para iniciar sesión.");
        router.push("/auth/login");
      }
    } catch (error: any) {
      console.log("Error:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo registrar el usuario.");
    } finally {
      hideLoading();
    }
  };

  /* --------------------------
        UI & DISEÑO NUEVO
  ---------------------------*/
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        {/* Fondo pastel */}
        <View style={styles.pastelTop} />
        <View style={styles.pastelBottom} />

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={palette.icon} />
        </TouchableOpacity>

        {/* HERO */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroGlow} />
          <Animated.View style={[styles.heroCircle, animatedHeroStyle]}>
           <Ionicons name="person-add-outline" size={70} color={palette.tint} />
          </Animated.View>
        </View>

        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

        {/* Selector de tipo */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeChip, userType === "worker" && styles.typeChipActive]}
            onPress={() => setUserType("worker")}
          >
            <Ionicons
              name="construct-outline"
              size={22}
              color={userType === "worker" ? palette.white : palette.icon}
            />
            <Text style={[styles.typeChipText, userType === "worker" && styles.typeChipTextActive]}>
              Soy Trabajador
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeChip, userType === "employer" && styles.typeChipActive]}
            onPress={() => setUserType("employer")}
          >
            <Ionicons
              name="briefcase-outline"
              size={22}
              color={userType === "employer" ? palette.white : palette.icon}
            />
            <Text style={[styles.typeChipText, userType === "employer" && styles.typeChipTextActive]}>
              Busco Trabajadores
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM en card */}
        <View style={styles.formCard}>
          {/* Nombre + Apellido */}
          <View style={styles.row}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor={palette.muted}
              style={styles.input}
            />
            <TextInput
              value={lastname}
              onChangeText={setLastname}
              placeholder="Apellido"
              placeholderTextColor={palette.muted}
              style={styles.input}
            />
          </View>

          {/* Email */}
          <TextInput
            value={email}
            onChangeText={(t) => setEmail(t.trim().toLowerCase())}
            placeholder="Email"
            placeholderTextColor={palette.muted}
            keyboardType="email-address"
            style={styles.input}
          />

          {/* Teléfono */}
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
            placeholder="Teléfono"
            placeholderTextColor={palette.muted}
            keyboardType="phone-pad"
            style={styles.input}
          />

          {/* DNI */}
          <TextInput
            value={dni}
            onChangeText={(t) => setDni(t.replace(/\D/g, ""))}
            placeholder="DNI"
            placeholderTextColor={palette.muted}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Contraseña */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Contraseña"
              value={password}
              secureTextEntry={!isPasswordVisible}
              onChangeText={setPassword}
              style={styles.passwordInput}
              placeholderTextColor={palette.muted}
            />
            {password.length > 0 && (
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={palette.muted}
                  style={{ padding: 14 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Confirmación */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Repetir contraseña"
              value={confirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
              placeholderTextColor={palette.muted}
            />
            {confirmPassword.length > 0 && (
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                <Ionicons
                  name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={palette.muted}
                  style={{ padding: 14 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Switches */}
        <View style={styles.switchRow}>
          <Switch value={acceptTerms} onValueChange={setAcceptTerms} thumbColor={acceptTerms ? palette.tint : "#ccc"} />
          <Text style={styles.switchText}>
            Acepto los <Text style={styles.link}>términos y condiciones</Text>
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Switch value={subscribe} onValueChange={setSubscribe} thumbColor={subscribe ? palette.tint : "#ccc"} />
          <Text style={styles.switchText}>Recibir ofertas y novedades por email</Text>
        </View>

        <PrimaryButton
          title="CREAR CUENTA"
          onPress={handleRegister}
          disabled={!acceptTerms}
          style={styles.btnWrapper}
        />

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>¿Ya tienes cuenta?</Text>
          <Link href="/auth/login" style={styles.link}>Inicia sesión</Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* --------------------------
       ESTILOS NUEVOS
---------------------------*/
const { SPACING, RADIUS, FONT } = theme;
const palette = theme.Colors.light;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: palette.background,
  },

  pastelTop: {
    position: "absolute",
    top: -140,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 300,
    backgroundColor: palette.tint,
    opacity: 0.18,
  },

  pastelBottom: {
    position: "absolute",
    bottom: -120,
    left: -110,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: palette.icon,
    opacity: 0.16,
  },

  backBtn: {
    marginBottom: SPACING.md,
    alignSelf: "flex-start",
  },

  /* HERO */
  heroWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },

  heroGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 200,
    backgroundColor: palette.tint,
    opacity: 0.18,
  },

  heroCircle: {
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },

  title: {
    fontSize: FONT.xxl,
    fontWeight: "800",
    textAlign: "center",
    color: palette.icon,
  },

  subtitle: {
    textAlign: "center",
    color: palette.muted,
    fontSize: FONT.sm,
    marginBottom: SPACING.lg,
  },

  /* Selector de tipo */
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.icon,
  },

  typeChipActive: {
    backgroundColor: palette.tint,
    borderColor: palette.tint,
  },

  typeChipText: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: "700",
  },

  typeChipTextActive: {
    color: palette.white,
  },

  /* FORM Card */
  formCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  input: {
    flex: 1,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: FONT.md,
  },

  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: RADIUS.md,
    backgroundColor: palette.white,
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: FONT.md,
    color: palette.text,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },

  switchText: {
    marginLeft: 10,
    color: palette.icon,
    fontSize: FONT.sm,
  },

  btnWrapper: {
    borderRadius: 50,
    marginVertical: SPACING.md,
  },

  footer: {
    marginTop: SPACING.sm,
    alignItems: "center",
  },

  footerTxt: {
    color: palette.muted,
    marginBottom: 4,
  },

  link: {
    color: palette.tint,
    fontWeight: "700",
  },
});
