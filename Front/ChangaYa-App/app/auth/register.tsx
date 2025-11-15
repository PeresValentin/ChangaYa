import { useState } from "react";
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
      } else {
        Alert.alert("Error", `Respuesta inesperada (${response.status})`);
      }
    } catch (error: any) {
      console.log("Error:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo registrar el usuario.");
    } finally {
      hideLoading();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      > 
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={palette.icon} />
        </TouchableOpacity>

        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

        <View style={styles.userTypeRow}>
          <TouchableOpacity
            style={[styles.userTypeBtn, userType === "worker" && styles.userTypeActive]}
            onPress={() => setUserType("worker")}
          >
            <View style={styles.userTypeBtnRow}>
              <Text style={styles.btnIcon}>👷</Text>
              <View style={styles.userTypeBtnClm}>
                <Text style={[styles.userTypeText, userType === "worker" && styles.userTypeTextActive]}>
                  Soy Trabajador
                </Text>
                <Text style={[styles.userTypeSmall, userType === "worker" && styles.userTypeSmallActive]}>
                  Busco changas
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.userTypeBtn, userType === "employer" && styles.userTypeActive]}
            onPress={() => setUserType("employer")}
          >
            <View style={styles.userTypeBtnRow}>
              <Text style={styles.btnIcon}>🏠</Text>
              <View style={styles.userTypeBtnClm}>
                <Text style={[styles.userTypeText, userType === "employer" && styles.userTypeTextActive]}>
                  Busco Trabajadores
                </Text>
                <Text style={[styles.userTypeSmall, userType === "employer" && styles.userTypeSmallActive]}>
                  Necesito contratar
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <TextInput
              value={name}
              onChangeText={(t) => setName(t.toLowerCase())}
              placeholder="Nombre"
              style={styles.input}
              placeholderTextColor={palette.muted}
            />
            <TextInput
              value={lastname}
              onChangeText={(t) => setLastname(t.toLowerCase())}
              placeholder="Apellido"
              style={styles.input}
              placeholderTextColor={palette.muted}
            />
          </View>

          <TextInput
            value={email}
            onChangeText={(t) => setEmail(t.toLowerCase().trim())}
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />

          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />

          <TextInput
            value={dni}
            onChangeText={(t) => setDni(t.replace(/\D/g, ""))}
            placeholder="DNI"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />

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

          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Repetir Contraseña"
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
            />

            {confirmPassword.length > 0 && (
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              >
                <Ionicons 
                  name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color={palette.muted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

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

        <PrimaryButton
          title="CREAR CUENTA"
          onPress={handleRegister}
          style={styles.btnWrapper}
          disabled={!acceptTerms}
        />

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>¿Ya tienes cuenta?</Text>
          <Link href="/auth/login" style={styles.link}>
            Inicia Sesión
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { Colors, RADIUS, SPACING, FONT } = theme;
const palette = Colors.light;

const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
  scrollContainer: { flex: 1 },
  container: {
    flexGrow: 1, 
    backgroundColor: palette.background,
    padding: SPACING.lg,
  },

  backBtn: { marginBottom: SPACING.md },
  title: {
    fontSize: FONT.xxl,
    fontWeight: "800",
    textAlign: "center",
    color: palette.icon,
  },
  subtitle: {
    fontSize: FONT.md,
    color: palette.muted,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },

  userTypeRow: { flexDirection: "row", marginBottom: SPACING.lg },
  userTypeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.icon,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: palette.white,
    minHeight: 70,
  },
  userTypeBtnRow:{ flexDirection: "row", alignItems: "center" },
  btnIcon:{ fontSize: 20, marginRight: 8 },
  userTypeBtnClm:{ flexDirection: "column", flex: 1 },

  userTypeActive: {
    backgroundColor: palette.tint,
    borderColor: palette.tint,
  },
  userTypeText: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: "900",
    textAlign: "left",
  },
  userTypeTextActive: { color: palette.white },
  userTypeSmall: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "left",
  },
  userTypeSmallActive: { color: palette.white },

  form: { gap: 12, marginBottom: SPACING.sm },
  row: { flexDirection: "row", gap: 8 },

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
    minHeight: 48,
  },

  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkboxText: { marginLeft: 8, fontSize: FONT.sm, color: palette.icon },

  btnWrapper: {
    marginTop: SPACING.lg,
    borderRadius: 50,
    width: "100%",
    alignSelf: "center",
  },

  footer: { marginTop: 20, alignItems: "center" },
  footerTxt: { color: palette.muted, marginBottom: 4 },
  link: { color: palette.tint, fontWeight: "700" },

  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: RADIUS.md,
    backgroundColor: palette.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: FONT.md,
    color: palette.text,
  },
  eyeButton: { padding: 14 },
});
