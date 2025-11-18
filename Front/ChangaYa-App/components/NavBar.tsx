import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, type Href } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import theme from "../constants/theme";
import { useProfileNavigation } from "../hooks/use-profile-navigation";

const { SPACING, RADIUS, FONT } = theme;
const palette = theme.Colors.light;

type QuickLink = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const quickLinks: QuickLink[] = [
  { id: "home", title: "Home", icon: "home-outline", route: "/home/trabajador" as Href },
  { id: "chats", title: "Chats", icon: "chatbubble-ellipses-outline", route: "/chats" as Href },
  { id: "mis-changas", title: "Mis Changas", icon: "briefcase-outline", route: "/changas/mis" as Href },
  { id: "perfil", title: "Perfil", icon: "person-circle-outline", route: "/profile" as Href },
];

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { goToProfile } = useProfileNavigation();

  return (
    <View style={styles.bottomNav}>
      {quickLinks.map((item) => {
        const routePath =
          typeof item.route === "string"
            ? item.route
            : (item.route as any)?.pathname ?? String(item.route);

        const isActive = pathname === routePath || pathname.startsWith(`${routePath}/`);

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => {
              if (item.id === "perfil") {
                goToProfile();
                return;
              }

              router.push(item.route);
            }}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? palette.tint : palette.icon}
            />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.title}</Text>
            {isActive ? <View style={styles.activeIndicator} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: palette.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  navItemActive: {
    position: "relative",
  },
  navText: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  navTextActive: {
    color: palette.tint,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.tint,
  },
});

export default NavBar;