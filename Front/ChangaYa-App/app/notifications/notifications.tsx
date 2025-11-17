// app/notificaciones.tsx
import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import theme from "../../constants/theme"; // Asegurate que la ruta a tu theme sea correcta
import { SafeAreaView } from 'react-native-safe-area-context';

// Constantes del Tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
// =========================================================
// COMPONENTE REUTILIZABLE PARA LAS FILAS CON TOGGLE
// =========================================================
interface SettingRowProps {
    label: string;
    description: string;
    value: boolean;
    onValueChange: (newValue: boolean) => void;
}
const SettingRow: React.FC<SettingRowProps> = ({ label, description, value, onValueChange }) => {
    return (
    <View style={styles.rowCard}>
    <View style={styles.rowTextContainer}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Switch
            trackColor={{ false: palette.border, true: palette.tint }}
            thumbColor={palette.white}
            ios_backgroundColor={palette.border}
            onValueChange={onValueChange}
            value={value}
            style={styles.switch}
        />
    </View>
    );
};
// =========================================================
// COMPONENTE PRINCIPAL DE LA PANTALLA
// =========================================================
export default function NotificacionesScreen() {
  const router = useRouter();
  // Estados para cada toggle, basados en el diseño
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [changasCercaEnabled, setChangasCercaEnabled] = useState(true);
  const [mensajesEnabled, setMensajesEnabled] = useState(true);
  const [estadoEnabled, setEstadoEnabled] = useState(true);
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Configuración del Header (título y botón atrás automático) */}
      <Stack.Screen
        options={{
          title: 'Notificaciones',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: palette.background }, // Fondo del header
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Tarjeta de Info Superior */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="notifications" size={24} color={palette.tint} />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.infoTitle}>Notificaciones activadas</Text>
            <Text style={styles.infoSubtitle}>
              Te mantendremos informado sobre changas
            </Text>
          </View>
        </View>
        {/* 2. Sección General */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingRow
            label="Notificaciones push"
            description="Recibe alertas instantáneas en tu dispositivo"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <SettingRow
            label="Notificaciones por email"
            description="Recibe resúmenes diarios en tu correo"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
        </View>
        {/* 3. Sección Trabajo (Específica del Trabajador) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Relacionadas con trabajo</Text>
          <SettingRow
            label="Nuevas changas cerca"
            description="Cuando haya trabajos en tu área"
            value={changasCercaEnabled}
            onValueChange={setChangasCercaEnabled}
          />
          <SettingRow
            label="Mensajes y chats"
            description="Cuando recibas mensajes nuevos"
            value={mensajesEnabled}
            onValueChange={setMensajesEnabled}
          />
          <SettingRow
            label="Actualizaciones de estado"
            description="Cambios en tus postulaciones"
            value={estadoEnabled}
            onValueChange={setEstadoEnabled}
          />
        </View>
        {/* 4. Sección Horario Silencioso */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Horario silencioso</Text>
          <TouchableOpacity
            style={styles.rowCard}
            // TODO: Implementar navegación a la pantalla de horario
            // onPress={() => router.push('/profile/horario-silencioso')}
          >
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowLabel}>22:00 - 08:00</Text>
              <Text style={styles.rowDescription}>
                Sin notificaciones en este horario
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={palette.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
// =========================================================
// ESTILO
// =========================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background, // Fondo gris claro de la app
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  // --- Tarjeta Info ---
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.tabIconSelected, // Fondo celeste/verde claro
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white, // Círculo blanco
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: FONT.md,
    fontWeight: '700' as const,
    color: palette.icon, // Texto oscuro
  },
  infoSubtitle: {
    fontSize: FONT.sm,
    color: palette.muted, // Texto más suave
    marginTop: 2,
  },
  // --- Secciones ---
  sectionContainer: {
    marginTop: SPACING.lg + SPACING.xs, // 28px
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: '700' as const,
    color: palette.icon,
    marginBottom: SPACING.sm,
  },
  // --- Filas ---
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm, // Espacio entre tarjetas
    borderWidth: 1,
    borderColor: palette.border,
  },
  rowTextContainer: {
    flex: 1, // Ocupa el espacio disponible
    marginRight: SPACING.md, // Deja espacio para el switch/flecha
  },
  rowLabel: {
    fontSize: FONT.md,
    fontWeight: '600' as const,
    color: palette.text,
  },
  rowDescription: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], // Switch un poco más grande
},
});