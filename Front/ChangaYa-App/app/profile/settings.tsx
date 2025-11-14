import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import theme from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const fontFamilies = theme.Fonts;

type IoniconName = keyof typeof Ionicons.glyphMap;

interface SettingOption {
  id: string;
  label: string;
  description?: string;
  icon: IoniconName;
  destructive?: boolean;
}

interface SettingsSection {
  id: string;
  title: string;
  options: SettingOption[];
}

const USER_SUMMARY = {
  name: "Rafael Eguren",
  email: "rafael.eguren@gmail.com",
  updatedAt: "Actualizado hace 2 hs",
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "account",
    title: "Mi cuenta",
    options: [
      {
        id: "edit-profile",
        label: "Editar perfil",
        description: "Actualizá tu información personal",
        icon: "person-outline",
      },
      {
        id: "favorites",
        label: "Favoritas (Changas)",
        description: "Tus changas guardadas",
        icon: "heart-outline",
      },
      {
        id: "history",
        label: "Historial",
        description: "Revisá tus últimos trabajos",
        icon: "time-outline",
      },
      {
        id: "notifications",
        label: "Notificaciones",
        description: "Controlá avisos y alertas",
        icon: "notifications-outline",
      },
    ],
  },
  
  {
    id: "support",
    title: "Soporte y ayuda",
    options: [
      {
        id: "help-center",
        label: "Centro de ayuda",
        description: "Preguntas frecuentes y guías",
        icon: "help-circle-outline",
      },
      {
        id: "contact-support",
        label: "Contactar soporte",
        description: "Obtené asistencia personalizada",
        icon: "chatbubbles-outline",
      },
    ],
  },

  {
    id: "security",
    title: "Seguridad",
    options: [
      {
        id: "logout",
        label: "Cerrar sesión",
        description: "Salir de este dispositivo",
        icon: "log-out-outline",
        destructive: true,
      },
    ],
  },
];

const AjustesScreen = () => {
  const router = useRouter();
  const initials = USER_SUMMARY.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const handleOptionPress = (optionId: string) => {
  switch (optionId) {
    case "notifications":
      router.push("/notifications/notifications");
      break;

    case "edit-profile":
    case "favorites":
    case "history":
    case "help-center":
    case "contact-support":
      console.log(`Opción "${optionId}" aún no implementada.`);
      
      break;
    case "logout":
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que querés cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Cerrar Sesión",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem("jwtToken");
                await AsyncStorage.removeItem("userData");
                    router.back(); 
                setTimeout(() => {
                  router.replace("/auth/welcome");
                }, 100);
              } catch (e) {
                console.error("Error al cerrar sesión:", e);
                Alert.alert("Error", "No se pudo cerrar la sesión.");
              }
            },
          },
        ]
      );
      break;
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Ajustes",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroInitials}>{initials}</Text>
          </View>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroName}>{USER_SUMMARY.name}</Text>
            <Text style={styles.heroEmail}>{USER_SUMMARY.email}</Text>
            <Text style={styles.heroUpdatedAt}>{USER_SUMMARY.updatedAt}</Text>
          </View>
        </View>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionDivider} />
            <View style={styles.sectionOptions}>
              {section.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionRow,
                    option.destructive && styles.optionRowDestructive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleOptionPress(option.id)}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      option.destructive && styles.optionIconDestructive,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={option.destructive ? palette.white : palette.tint}
                    />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text
                      style={[
                        styles.optionLabel,
                        option.destructive && styles.optionLabelDestructive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text
                        style={[
                          styles.optionDescription,
                          option.destructive && styles.optionLabelDestructive,
                        ]}
                      >
                        {option.description}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={option.destructive ? palette.white : palette.muted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingBottom: SPACING.lg * 2,
  },
  heroCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg * 1.4,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitials: {
    color: palette.white,
    fontSize: FONT.xl,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  heroTextWrapper: {
    flex: 1,
    gap: SPACING.xs,
  },
  heroName: {
    fontSize: FONT.xl,
    color: palette.text,
    fontWeight: "700",
    fontFamily: fontFamilies.rounded,
  },
  heroEmail: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  heroUpdatedAt: {
    fontSize: FONT.lg,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
  sectionCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontFamily: fontFamilies.rounded,
    fontWeight: "700",
    color: palette.text,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: palette.background,
  },
  sectionOptions: {
    gap: SPACING.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: palette.background,
    gap: SPACING.md,
  },
  optionRowDestructive: {
    backgroundColor: palette.tint,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconDestructive: {
    backgroundColor: `${palette.white}22`,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: FONT.md,
    color: palette.text,
    fontFamily: fontFamilies.rounded,
    fontWeight: "600",
  },
  optionLabelDestructive: {
    color: palette.white,
  },
  optionDescription: {
    fontSize: FONT.sm,
    color: palette.muted,
    fontFamily: fontFamilies.rounded,
  },
});

export default AjustesScreen;
