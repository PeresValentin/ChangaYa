import { useState } from "react";
import {
  Alert,
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
import axios from "axios";


export default function RegisterScreen() {
  const palette = theme.Colors.light;
  const [userType, setUserType] = useState<"worker" | "employer">("worker");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  const router = useRouter();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!acceptTerms) {
      Alert.alert("Debes aceptar los términos y condiciones");
      return;
    }

    try {
      const response = await axios.post("http://192.168.0.194:3000/api/usuarios", {
        nombreUsuario: email.split("@")[0], // o pedí un campo específico si lo tenés
        clave: password,
        nombre: name,
        apellido: lastname,
        dni: dni,
        email: email,
        telefono: phone,
        tipoUsuario: userType === "worker" ? "trabajador" : "contratante"
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("✅ Registro exitoso", "Por favor, valida tu email antes de iniciar sesión.");
        router.push("/auth/login");
      } else {
        Alert.alert("Error", `Respuesta inesperada (${response.status})`);
      }
    } catch (error: any) {
      console.log("Detalles del error:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo registrar el usuario");
    }
  };

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
          <View style={styles.userTypeBtnRow}>
            <Text
            style={styles.btnIcon}
            >
            👷
            </Text>
            <View style={styles.userTypeBtnClm}>
              <Text
              style={[
                styles.userTypeText,
                userType === "worker" && styles.userTypeTextActive,
              ]}
              >
              Soy Trabajador
              </Text>
              <Text
                style={[
                  styles.userTypeSmall,
                  userType === "worker" && styles.userTypeSmallActive,
                ]}
              >
                Busco changas para trabajar
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeBtn,
            userType === "employer" && styles.userTypeActive,
          ]}
          onPress={() => setUserType("employer")}
        > 
          <View style={styles.userTypeBtnRow}>
            <Text
            style={styles.btnIcon}
            >
            🏠
            </Text>
            <View style={styles.userTypeBtnClm}>
              <Text
              style={[
                styles.userTypeText,
                userType === "employer" && styles.userTypeTextActive,
              ]}
              >
              Busco Trabajadores
              </Text>
              <Text
                style={[
                  styles.userTypeSmall,
                  userType === "employer" && styles.userTypeSmallActive,
                ]}
              >
                Necesito contratar servicios
              </Text>
            </View>
          </View>
          
        </TouchableOpacity>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
          <TextInput
            value={lastname}
            onChangeText={setLastname}
            placeholder="Apellido"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
        </View>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Teléfono"
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />

        <TextInput
          value={dni}
          onChangeText={setDni}
          placeholder="DNI"
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={palette.muted}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
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
        onPress={handleRegister}
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
    backgroundColor: palette.background,
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
    fontSize: FONT.md,
    color: palette.muted,
    textAlign: "center" as const,
    marginBottom: SPACING.lg,
  },
  userTypeRow: {
    flexDirection: "row" as const,
    alignItems: "center",
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
    alignItems: "stretch",
    justifyContent: "center",
    minHeight: 70, // misma altura para ambos
  },
  userTypeBtnRow:{
    flexDirection: "row" as const,
    alignItems: "center",
  },
  btnIcon:{
    fontSize: 20,
    marginRight: 8,
  },
  userTypeBtnClm:{
    flexDirection: "column" as const,
    flex: 1,
  },
  userTypeActive: {
    backgroundColor: palette.tint, // verde igual al botón principal
    borderColor: palette.tint,
  },
  userTypeText: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: "900" as const,
    textAlign: "left" as const,
  },
  userTypeTextActive: {
    color: palette.white,
  },
  userTypeSmall: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: "left" as const,
  },
  userTypeSmallActive: {
    color: palette.white,
  },
  form: {
    height: 280,
    gap: 12,
    marginBottom: SPACING.sm,
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
    minHeight: 48,
    textAlignVertical: "center", // Android
    lineHeight: FONT.md + 6,     // da más aire al placeholder
  },
  checkboxRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
