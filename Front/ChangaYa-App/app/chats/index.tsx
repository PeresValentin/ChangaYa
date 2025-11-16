// app/chats/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../constants/theme';
import { useProfileNavigation } from '../../hooks/use-profile-navigation';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

interface ApiChatSummary {
  chatID: string;
  fechaInicio: string;
  otroUsuario: {
    usuarioID: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    telefono: string;
    email: string;
  };
  ultimoMensaje: string | null;
  fechaUltimoMensaje: string | null;
}

const ChatsScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { goToProfile } = useProfileNavigation();

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Formateador de hora
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Fetch a /api/chats/mine
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return;

      const response = await axios.get<ApiChatSummary[]>(
        `${API_URL}/api/chats/mine`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Transformamos backend → frontend
      const mappedChats: Chat[] = response.data.map((chat) => ({
        id: chat.chatID,
        user: `${chat.otroUsuario.nombre} ${chat.otroUsuario.apellido}`,
        lastMessage: chat.ultimoMensaje ?? "Sin mensajes aún",
        time: formatTime(chat.fechaUltimoMensaje ?? chat.fechaInicio),
        unread: 0 // Más adelante con WebSockets
      }));

      setChats(mappedChats);
    } catch (err) {
      console.log("Error cargando chats:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Navegar al chat
  const handleChatPress = (chatId: string) => {
    router.push({ pathname: "/chats/[id]", params: { id: chatId } });
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
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={palette.tint} style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={chats.filter((chat) =>
                chat.user.toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatListItem chat={item} onPress={() => handleChatPress(item.id)} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* NAVIGATION */}
        <View style={styles.bottomNav}>
          {/* (Se deja igual tu nav actual) */}
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