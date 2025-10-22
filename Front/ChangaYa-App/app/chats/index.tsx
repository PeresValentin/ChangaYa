// Front/ChangaYa-App/app/chats/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import theme from '../../constants/theme';
import { useProfileNavigation } from '../../hooks/use-profile-navigation'; // agregado

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

const DUMMY_CHATS: Chat[] = [
  {
    id: '1',
    user: 'Ana Martínez',
    lastMessage: '¡Perfecto! Llego en 15 minutos',
    time: '10:30',
    unread: 2,
  },
  {
    id: '2',
    user: 'Carlos López',
    lastMessage: 'Gracias por la changa! Todo...',
    time: 'Ayer',
    unread: 0,
  },
];

const quickLinks: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
}[] = [
  { id: 'home', title: 'Home', icon: 'home-outline', route: '/home/trabajador' as Href },
  { id: 'chats', title: 'Chats', icon: 'chatbubble-ellipses-outline', route: '/chats' as Href },
  { id: 'mis-changas', title: 'Mis Changas', icon: 'briefcase-outline', route: '/changas/mis' as Href },
  { id: 'perfil', title: 'Perfil', icon: 'person-circle-outline', route: '/perfil' as Href },
];

const ChatsScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [chats] = useState<Chat[]>(DUMMY_CHATS);
  const [searchText, setSearchText] = useState('');
  const { goToProfile } = useProfileNavigation(); // nuevo hook

  const handleChatPress = (chatId: string) => {
    router.push({ pathname: '/chats/[id]', params: { id: chatId } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.headerTitle}>Chats</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={palette.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar conversaciones..."
              placeholderTextColor={palette.muted}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.editIconContainer}>
              <Ionicons name="create-outline" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={chats.filter((chat) =>
              chat.user.toLowerCase().includes(searchText.toLowerCase()),
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatListItem chat={item} onPress={() => handleChatPress(item.id)} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        <View style={styles.bottomNav}>
          {quickLinks.map((item) => {
            const routePath =
              typeof item.route === 'string'
                ? item.route
                : (item.route as any)?.pathname ?? String(item.route);
            const isActive = pathname === routePath || pathname.startsWith(`${routePath}/`);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => {
                  if (item.id === 'perfil') {
                    goToProfile();
                    return;
                  }
                  if (item.id === 'home') {
                    router.back();
                  } else {
                    router.push(item.route);
                  }
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? palette.tint : palette.icon}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.title}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};
// =========================================================
// ESTILOS
// =========================================================
const styles = StyleSheet.create({
	// --- Estilos de Layout (de trabajador.tsx) ---
	safeArea: {
		flex: 1,
		backgroundColor: palette.background,
	},
	container: {
		flex: 1,
	},
	contentWrapper: {
		flex: 1,
		// Usamos el padding de trabajador.tsx para consistencia
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
	},

	// --- Estilos de Chats (Ajustados al tema) ---
	headerTitle: {
		fontSize: 30, // Tu tamaño original
		fontWeight: 'bold',
		marginBottom: SPACING.md,
		color: palette.icon, // Color del tema
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: palette.white, // Color del tema
		borderRadius: RADIUS.lg, // Radius del tema
		marginBottom: SPACING.md, // Spacing del tema
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		gap: SPACING.sm, // Gap del tema
		borderWidth: 1,
		borderColor: palette.border, // Borde del tema
	},
	searchIcon: {
		marginRight: SPACING.sm,
		color: palette.muted,
	},
	searchInput: {
		flex: 1,
		fontSize: FONT.md,
		color: palette.icon,
		// La altura se maneja con padding
	},
	editIconContainer: {
		padding: 5,
	},
	separator: {
		height: 1,
		backgroundColor: palette.border, // Color del tema
		marginLeft: 80,
	},

	// --- Estilos de Bottom Nav (Copiados 1:1 de trabajador.tsx) ---
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
	navText: { // <-- CORREGIDO (sin 'i')
		fontSize: FONT.sm,
		color: palette.muted,
	},
	navTextActive: {
		color: palette.tint,
		fontWeight: "600" as const,
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

export default ChatsScreen;