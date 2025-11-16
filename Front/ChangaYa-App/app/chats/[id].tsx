// app/chats/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import theme from '../../constants/theme';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// =======================
// Tipos API
// =======================
interface ApiMensaje {
  mensajeID: string;
  fecha: string;
  contenido: string;
  archivoAdjunto?: string | null;
  chatID: string;
  usuarioID: string;
}

interface ApiChatUser {
  usuarioID: string;
  nombre?: string;
  apellido?: string;
  nombreUsuario?: string;
  email?: string;
  telefono?: string;
  rankingGeneral?: number | null;
}

interface ApiChatDetalle {
  chatID: string;
  fechaInicio: string;
  usuario1: ApiChatUser;
  usuario2: ApiChatUser;
}

// =======================
// Tipos Front
// =======================
type Message = {
  id: string;
  text: string;
  time: string;
  senderId: string;
};

type JwtPayload = {
  id?: string;
  usuarioID?: string;
  userId?: string;
  email?: string;
  rol?: string;
};

// =======================
// Helpers
// =======================
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const mapApiMessageToMessage = (m: ApiMensaje): Message => ({
  id: m.mensajeID,
  text: m.contenido,
  time: new Date(m.fecha).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  senderId: m.usuarioID,
});

const getDisplayName = (u?: ApiChatUser | null) => {
  if (!u) return '';
  const full = `${u.nombre || ''} ${u.apellido || ''}`.trim();
  return full || u.nombreUsuario || 'Usuario';
};

const getInitials = (u?: ApiChatUser | null) => {
  const name = getDisplayName(u);
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  return initials || name[0]?.toUpperCase() || '?';
};

// =======================
// Burbuja de Mensaje
// =======================
const MessageBubble = ({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string | null;
}) => {
  const isCurrentUser = currentUserId != null && message.senderId === currentUserId;

  return (
    <View style={[styles.messageRow, isCurrentUser ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.textRight : styles.textLeft,
          ]}
        >
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {message.time} {isCurrentUser && '✓✓'}
      </Text>
    </View>
  );
};

// =======================
// Tarjeta de Changa (placeholder)
// =======================
const RelatedChangaCard = () => (
  <View style={styles.changaCard}>
    <View style={styles.changaIcon}>
      <Ionicons name="build-outline" size={24} color="#34A853" />
    </View>
    <View style={styles.changaDetails}>
      <Text style={styles.changaTitle}>Changa relacionada</Text>
      <Text style={styles.changaInfo}>Vinculá acá la changa real luego</Text>
    </View>
  </View>
);

// =======================
// Pantalla principal
// =======================
const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goToProfile } = useProfileNavigation();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [details, setDetails] = useState<ApiChatDetalle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);

  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const lastTypingRef = useRef(false);

  // ---- Derivar el otro usuario del chat ----
  const otherUser: ApiChatUser | null = useMemo(() => {
    if (!details || !currentUserId) return null;
    return details.usuario1.usuarioID === currentUserId
      ? details.usuario2
      : details.usuario1;
  }, [details, currentUserId]);

  // =======================
  // 1) Cargar token, userID, chatDetails y mensajes iniciales
  // =======================
  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const storedToken = await AsyncStorage.getItem('jwtToken');
        if (!storedToken) {
          console.warn('⛔ No hay token JWT en AsyncStorage');
          setLoading(false);
          return;
        }
        setToken(storedToken);

        const decoded = jwtDecode<JwtPayload>(storedToken);
        const userIdFromToken =
          decoded.id || decoded.usuarioID || decoded.userId || null;
        setCurrentUserId(userIdFromToken);

        // Traer detalles del chat (usuario1/usuario2)
        const chatRes = await axios.get<ApiChatDetalle>(
          `${API_URL}/api/chats/${id}`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        setDetails(chatRes.data);

        // Traer mensajes del chat
        const msgRes = await axios.get<ApiMensaje[]>(
          `${API_URL}/api/chats/${id}/mensajes`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );

        const mapped = msgRes.data
          .slice()
          .sort(
            (a, b) =>
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          )
          .map(mapApiMessageToMessage);

        setMessages(mapped);
      } catch (err) {
        console.error('❌ Error inicializando chat:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  // =======================
  // 2) Conectar socket.io y manejar eventos
  // =======================
  useEffect(() => {
    if (!id || !currentUserId || !token || !API_URL) return;

    const socket = io(API_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.emit('joinChat', { chatID: id, userID: currentUserId });

    // Nuevo mensaje recibido
    socket.on('nuevoMensaje', (apiMsg: ApiMensaje) => {
      if (apiMsg.chatID !== id) return;
      setMessages((prev) => [mapApiMessageToMessage(apiMsg), ...prev]);
    });

    // Indicador escribiendo...
    socket.on('typing', ({ userID, isTyping }) => {
      if (!otherUser) return;
      if (userID === otherUser.usuarioID) {
        setIsOtherTyping(!!isTyping);
      }
    });

    // Presencia básica
    socket.on('userOnline', ({ userID }) => {
      if (otherUser && userID === otherUser.usuarioID) {
        setIsOtherOnline(true);
      }
    });

    socket.on('userOffline', ({ userID }) => {
      if (otherUser && userID === otherUser.usuarioID) {
        setIsOtherOnline(false);
      }
    });

    return () => {
      socket.emit('leaveChat', { chatID: id, userID: currentUserId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, currentUserId, token, otherUser?.usuarioID]);

  // =======================
  // 3) Enviar mensaje
  // =======================
  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (!socketRef.current || !id || !currentUserId) return;

    const contenido = newMessage.trim();
    setNewMessage('');

    // Optimistic UI
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      text: contenido,
      time: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderId: currentUserId,
    };

    setMessages((prev) => [optimisticMsg, ...prev]);

    socketRef.current.emit('sendMessage', {
      chatID: id,
      contenido,
      // userID es opcional, el backend puede tomar socket.data.userID
    });
  };

  // =======================
  // 4) Cambio de texto -> "typing"
  // =======================
  const handleChangeText = (text: string) => {
    setNewMessage(text);

    if (!socketRef.current || !id) return;

    const isTypingNow = text.trim().length > 0;
    if (isTypingNow !== lastTypingRef.current) {
      socketRef.current.emit('typing', { chatID: id, isTyping: isTypingNow });
      lastTypingRef.current = isTypingNow;
    }
  };

  // =======================
  // 5) Render
  // =======================
  const headerSubtitle = isOtherTyping
    ? 'Escribiendo...'
    : isOtherOnline
    ? 'En línea'
    : 'Desconectado';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* HEADER CONFIG */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {getInitials(otherUser)}
                </Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {getDisplayName(otherUser) || 'Chat'}
                </Text>
                <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
              </View>
            </View>
          ),
          headerRight: () =>
            otherUser ? (
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => goToProfile(otherUser.usuarioID)}
              >
                <Ionicons name="person-circle-outline" size={24} color="#333" />
              </TouchableOpacity>
            ) : null,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F9FEFB' },
        }}
      />

      {/* LISTA DE MENSAJES */}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item} currentUserId={currentUserId} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
        inverted
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: SPACING.lg }}>
              <Text style={styles.emptyText}>Todavía no hay mensajes.</Text>
            </View>
          ) : null
        }
      />

      {/* CHANGA RELACIONADA (placeholder, luego la conectás) */}
      {/* <RelatedChangaCard />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="mic-outline" size={24} color="#555" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={handleChangeText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};


export default ChatScreen;

// --- Estilos (Basados en tu captura) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FEFB',
    },

    // ===== HEADER =====
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#E0F0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#111',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#555',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        gap: 8,
    },
    headerIconButton: {
        padding: 6,
    },

    // ===== LISTA DE MENSAJES =====
    messageList: {
        flex: 1,
    },

    messageRow: {
        marginBottom: 10,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rowLeft: {
        alignSelf: 'flex-start',
    },
    rowRight: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },

    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 2,
    },
    bubbleLeft: {
        backgroundColor: '#E6E6E6',
        borderBottomLeftRadius: 5,
    },
    bubbleRight: {
        backgroundColor: '#34A853',
        borderBottomRightRadius: 5,
    },

    messageText: {
        fontSize: 16,
    },
    textLeft: {
        color: '#000',
    },
    textRight: {
        color: '#fff',
    },

    timestamp: {
        fontSize: 12,
        color: '#999',
        paddingHorizontal: 5,
    },

    // Para mensajes de ubicación
    locationBubble: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // ===== CHANGA CARD =====
    changaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginBottom: 5,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    changaIcon: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: '#E6F4EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    changaDetails: {
        flex: 1,
    },
    changaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    changaInfo: {
        fontSize: 14,
        color: '#666',
    },

    // ===== INPUT =====
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginHorizontal: 10,
        maxHeight: 100,
    },
    iconButton: {
        padding: 5,
    },
    sendButton: {
        backgroundColor: '#34A853',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ===== LIST EMPTY =====
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        padding: 20,
        fontSize: 15,
    },
});