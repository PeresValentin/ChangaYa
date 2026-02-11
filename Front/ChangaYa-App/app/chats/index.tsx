// app/chats/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import ChatListItem, { Chat } from '../../components/ChatListItem';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

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
   const [refreshing, setRefreshing] = useState(false);

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
   const fetchChats = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return;

      const response = await axios.get<ApiChatSummary[]>(
        `${API_URL}/api/chats/mine`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const otherUserIds = Array.from(
        new Set(
          response.data
            .map((chat) => chat.otroUsuario?.usuarioID)
            .filter((id): id is string => Boolean(id))
        )
      );

      const avatarMap = new Map<string, string | null>();
      await Promise.all(
        otherUserIds.map(async (userId) => {
          try {
            const perfilResponse = await axios.get(
              `${API_URL}/api/perfil/usuario/${userId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const fotoURL = perfilResponse.data?.fotoURL
              ? `${perfilResponse.data.fotoURL}?t=${Date.now()}`
              : null;
            avatarMap.set(userId, fotoURL);
          } catch (perfilError) {
            console.warn("No pudimos obtener el avatar del chat", perfilError);
            avatarMap.set(userId, null);
          }
        })
      );

      // Transformamos backend → frontend
      const mappedChats: Chat[] = response.data.map((chat) => ({
        id: chat.chatID,
        user: `${chat.otroUsuario.nombre} ${chat.otroUsuario.apellido}`,
        lastMessage: chat.ultimoMensaje ?? "Sin mensajes aún",
        time: formatTime(chat.fechaUltimoMensaje ?? chat.fechaInicio),
        unread: 0, // Más adelante con WebSockets
        avatarUrl: avatarMap.get(chat.otroUsuario.usuarioID) ?? null,
      }));

      setChats(mappedChats);
    } catch (err) {
      console.log("Error cargando chats:", err);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [API_URL]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats({ silent: true });
    }, [fetchChats])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChats({ silent: true });
    setRefreshing(false);
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
               refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>

         <NavBar />
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
                paddingBottom: SPACING.lg * 6,
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

	
});

export default ChatsScreen;