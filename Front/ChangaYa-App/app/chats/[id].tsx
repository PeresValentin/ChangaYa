// app/chats/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import theme from '../../constants/theme';

const { SPACING } = theme;

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

type Attachment = {
  type: 'audio';
  uri?: string;
  base64?: string;
  durationMs?: number;
};

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  formattedTime: string;
  isPending?: boolean;
  attachment?: Attachment | null;
};
type JwtPayload = {
  id?: string;
  usuarioID?: string;
  userId?: string;
  email?: string;
  rol?: string;
};

const formatTime = (date: string | number | Date) =>
  new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDuration = (ms?: number) => {
  if (!ms || Number.isNaN(ms)) return '0:00';
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const parseAttachment = (raw?: string | null): Attachment | null => {
  if (!raw) return null;

  const fallbackFromDataUrl = () => {
    if (raw.startsWith('data:audio')) {
      const [, base64Content] = raw.split(',');
      return {
        type: 'audio',
        base64: base64Content || raw,
      } satisfies Attachment;
    }
    return null;
  };

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === 'audio') {
      if (typeof parsed.base64 === 'string') {
        return {
          type: 'audio',
          base64: parsed.base64,
          durationMs: typeof parsed.durationMs === 'number' ? parsed.durationMs : undefined,
        } satisfies Attachment;
      }

      if (typeof parsed.uri === 'string') {
        return {
          type: 'audio',
          uri: parsed.uri,
          durationMs: typeof parsed.durationMs === 'number' ? parsed.durationMs : undefined,
        } satisfies Attachment;
      }
    }
  } catch {
    return fallbackFromDataUrl();
  }

  if (raw.startsWith('http') || raw.startsWith('file:')) {
    return { type: 'audio', uri: raw } satisfies Attachment;
  }

  return fallbackFromDataUrl();
};


// =======================
// Helpers
// =======================
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const AUDIO_PLACEHOLDER_TEXT = '[Audio]';

const mapApiMessageToMessage = (m: ApiMensaje): Message => ({
  id: m.mensajeID,
  text: m.contenido || '',
  createdAt: m.fecha,
  formattedTime: formatTime(m.fecha),
  senderId: m.usuarioID,
  attachment: parseAttachment(m.archivoAdjunto),
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
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return initials || name[0]?.toUpperCase() || '?';
};


let globalSound: Audio.Sound | null = null;

const stopGlobalSound = async () => {
  if (globalSound) {
    try {
      await globalSound.stopAsync();
      await globalSound.unloadAsync();
    } catch {}
    globalSound = null;
  }
};

// =======================
// Audio Attachment
// =======================
const AudioAttachment = ({
  attachment,
  isCurrentUser,
}: {
  attachment: Attachment & { type: 'audio' };
  isCurrentUser: boolean;
}) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playableUri, setPlayableUri] = useState<string | null>(attachment.uri ?? null);
  const tempFileUriRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cleanupTempFile = async () => {
      if (tempFileUriRef.current) {
        try {
          await FileSystem.deleteAsync(tempFileUriRef.current, { idempotent: true });
        } catch (error) {
          console.warn('Error limpiando audio temporal:', error);
        }
        tempFileUriRef.current = null;
      }
    };

    const stopExistingSound = async () => {
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.error('Error deteniendo audio:', error);
        }
        soundRef.current = null;
        setIsPlaying(false);
      }
    };

    const ensureUri = async () => {
      if (attachment.uri) {
        await stopExistingSound();
        await cleanupTempFile();
        if (isMounted) setPlayableUri(attachment.uri);
        return;
      }

      if (!attachment.base64) return;

      try {
        await stopExistingSound();
        await cleanupTempFile();
        const tempUri = `${FileSystem.cacheDirectory}voice-${Date.now()}-${Math.random()}.m4a`;
        await FileSystem.writeAsStringAsync(tempUri, attachment.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        tempFileUriRef.current = tempUri;
        if (isMounted) {
          setPlayableUri(tempUri);
        }
      } catch (error) {
        console.error('Error preparando audio:', error);
      }
    };

    ensureUri();

    return () => {
      isMounted = false;
    };
  }, [attachment.base64, attachment.uri]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (tempFileUriRef.current) {
        FileSystem.deleteAsync(tempFileUriRef.current, { idempotent: true }).catch(() => {});
        tempFileUriRef.current = null;
      }
    };
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!playableUri) return;

    try {
      // 🔥 DETENER AUDIO GLOBAL SI EXISTE
      if (!soundRef.current) {
        await stopGlobalSound();
      }

      if (!soundRef.current) {
        setIsLoading(true);

        const { sound } = await Audio.Sound.createAsync({ uri: playableUri });
        soundRef.current = sound;
        globalSound = sound; // 🔥 REGISTRAR COMO AUDIO GLOBAL

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);
          // 🔥 Cuando terminó, NO volver a reproducir
          if (status.didJustFinish) {
            sound.setPositionAsync(0);
            sound.pauseAsync();       // 🔥 aseguramos que quede pausado
            setIsPlaying(false);
            globalSound = null;
          }
        });

        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await stopGlobalSound();        //  PARAR CUALQUIER OTRO ANTES
          globalSound = soundRef.current; //  REGISTRASTE ESTE COMO EL ÚNICO
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [playableUri])

  return (
    <View style={styles.audioBubble}>
      <TouchableOpacity
        style={[styles.audioPlayButton, (!playableUri || isLoading) && styles.audioButtonDisabled]}
        onPress={togglePlayback}
        disabled={!playableUri || isLoading}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#fff" />
      </TouchableOpacity>
      <View style={styles.audioMeta}>
        <Text style={[styles.audioLabel, isCurrentUser ? styles.textRight : styles.textLeft]}>
          Nota de voz
        </Text>
        {attachment.durationMs ? (
          <Text
            style={[styles.audioDuration, isCurrentUser ? styles.textRight : styles.textLeft]}
          >
            {formatDuration(attachment.durationMs)}
          </Text>
        ) : null}
      </View>
    </View>
  );
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
  const audioAttachment = message.attachment?.type === 'audio' ? message.attachment : null;
  const shouldShowText =
    !!message.text &&
    message.text.trim().length > 0 &&
    (!audioAttachment || message.text !== AUDIO_PLACEHOLDER_TEXT);

  return (
    <View
      style={[
        styles.messageRow,
        isCurrentUser ? styles.rowRight : styles.rowLeft,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        {audioAttachment ? (
          <AudioAttachment attachment={audioAttachment} isCurrentUser={isCurrentUser} />
        ) : null}

        {shouldShowText ? (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.textRight : styles.textLeft,
            ]}
          >
            {message.text}
          </Text>
        ) : null}

        {/* HORA + TILDES DENTRO DE LA BURBUJA */}
        <View style={styles.timestampWrapper}>
          <Text
            style={[
              styles.timestampInside,
              isCurrentUser ? styles.timestampRight : styles.timestampLeft,
            ]}
          >
            {message.formattedTime}
          </Text>

          {isCurrentUser && !message.isPending ? (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={isCurrentUser ? '#DFF6E4' : '#7A7A7A'}
              style={{ marginLeft: 3 }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};


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
const [isRecording, setIsRecording] = useState(false);
  const [recordingTimeMs, setRecordingTimeMs] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [otherUserAvatarUrl, setOtherUserAvatarUrl] = useState<string | null>(null);
   const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const clearRecordingTimer = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, []);
  const socketRef = useRef<Socket | null>(null);
  const lastTypingRef = useRef(false);
   const listRef = useRef<FlatList<Message> | null>(null);

  // ---- Derivar el otro usuario del chat ----
  const otherUser: ApiChatUser | null = useMemo(() => {
    if (!details || !currentUserId) return null;
    return details.usuario1.usuarioID === currentUserId
      ? details.usuario2
      : details.usuario1;
  }, [details, currentUserId]);

  useEffect(() => {
    const loadOtherUserAvatar = async () => {
      if (!otherUser?.usuarioID || !token) return;

      try {
        const perfilResponse = await axios.get(
          `${API_URL}/api/perfil/usuario/${otherUser.usuarioID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fotoURL = perfilResponse.data?.fotoURL
          ? `${perfilResponse.data.fotoURL}?t=${Date.now()}`
          : null;
        setOtherUserAvatarUrl(fotoURL);
      } catch (perfilError) {
        console.warn('No pudimos obtener el avatar del chat', perfilError);
        setOtherUserAvatarUrl(null);
      }
    };

    loadOtherUserAvatar();
  }, [otherUser?.usuarioID, token]);

  const sortMessages = useCallback((items: Message[]) => {
    return items.slice().sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, []);

  const mergeIncomingMessage = useCallback(
    (incoming: Message) => {
      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (msg) =>
            !(
              msg.isPending &&
              msg.senderId === incoming.senderId &&
              msg.text === incoming.text
            )
        );

        const existingIndex = withoutOptimistic.findIndex(
          (msg) => msg.id === incoming.id
        );

        if (existingIndex !== -1) {
          const updated = [...withoutOptimistic];
          updated[existingIndex] = { ...incoming };
          return sortMessages(updated);
        }

        return sortMessages([...withoutOptimistic, incoming]);
      });
    },
    [sortMessages]
  );
   const sendAudioMessage = useCallback(
    async (uri: string, durationMs?: number) => {
      if (!socketRef.current || !id || !currentUserId) return;

      try {
        setIsSendingAudio(true);
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const contenido = AUDIO_PLACEHOLDER_TEXT;
        const attachmentPayload = {
          type: 'audio',
          mimeType: 'audio/m4a',
          base64: base64Audio,
          durationMs,
        };

        const optimisticMsg: Message = {
          id: `temp-audio-${Date.now()}`,
          text: contenido,
          senderId: currentUserId,
          createdAt: new Date().toISOString(),
          formattedTime: formatTime(new Date()),
          isPending: true,
          attachment: {
            type: 'audio',
            uri,
            durationMs,
          },
        };

        setMessages((prev) => sortMessages([...prev, optimisticMsg]));

        socketRef.current.emit('sendMessage', {
          chatID: id,
          contenido,
          archivoAdjunto: JSON.stringify(attachmentPayload),
        });
      } catch (error) {
        console.error('Error enviando audio:', error);
      } finally {
        setIsSendingAudio(false);
      }
    },
    [currentUserId, id, sortMessages]
  );

  const startRecording = useCallback(async () => {
    if (isRecording || isSendingAudio) return;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso al micrófono para poder grabar y enviar notas de voz.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      recordingStartTimeRef.current = Date.now();
      setRecordingTimeMs(0);
      setIsRecording(true);

      clearRecordingTimer();
      recordingIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          setRecordingTimeMs(Date.now() - recordingStartTimeRef.current);
        }
      }, 200);
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      setIsRecording(false);
      clearRecordingTimer();
    }
  }, [clearRecordingTimer, isRecording, isSendingAudio]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const durationMs = recordingStartTimeRef.current
        ? Date.now() - recordingStartTimeRef.current
        : recordingTimeMs;

      recordingRef.current = null;
      recordingStartTimeRef.current = null;
      setIsRecording(false);
      clearRecordingTimer();
      setRecordingTimeMs(0);

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        await sendAudioMessage(uri, durationMs);
      }
    } catch (error) {
      console.error('Error deteniendo grabación:', error);
    } finally {
      recordingRef.current = null;
      recordingStartTimeRef.current = null;
      setIsRecording(false);
      clearRecordingTimer();
      setRecordingTimeMs(0);
    }
  }, [clearRecordingTimer, recordingTimeMs, sendAudioMessage]);

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
          .map(mapApiMessageToMessage)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

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
      mergeIncomingMessage(mapApiMessageToMessage(apiMsg));
    });

    // Indicador escribiendo...
    socket.on('typing', ({ userID, isTyping }) => {
     if (userID === otherUser?.usuarioID) {
        setIsOtherTyping(!!isTyping);
      }
    });

    // Presencia básica
    socket.on('userOnline', ({ userID }) => {
       if (userID === otherUser?.usuarioID) {
        setIsOtherOnline(true);
      }
    });

    socket.on('userOffline', ({ userID }) => {
      if (userID === otherUser?.usuarioID) {
        setIsOtherOnline(false);
      }
    });

    return () => {
      socket.emit('leaveChat', { chatID: id, userID: currentUserId });
      socket.disconnect();
      socketRef.current = null;
      setIsOtherTyping(false);
      setIsOtherOnline(false);
    };
 }, [currentUserId, id, mergeIncomingMessage, otherUser?.usuarioID, token]);
  // =======================
  // 3) Enviar mensaje
  // =======================
  const handleSend = () => {
    if (isRecording || isSendingAudio) return;
    if (!newMessage.trim()) return;
    if (!socketRef.current || !id || !currentUserId) return;

    const contenido = newMessage.trim();
    setNewMessage('');

    // Optimistic UI
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      text: contenido,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      formattedTime: formatTime(new Date()),
      isPending: true,
    };

    setMessages((prev) => sortMessages([...prev, optimisticMsg]));

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

  useEffect(() => {
    if (!messages.length) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);


  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} currentUserId={currentUserId} />
    ),
    [currentUserId]
  );

  // =======================
  // 5) Render
  // =======================
  const headerSubtitle = isOtherTyping
    ? 'Escribiendo...'
    : isOtherOnline
    ? 'En línea'
    : 'Desconectado';

   const headerDisplayName = getDisplayName(otherUser) || 'Chat';
   const canSendText = newMessage.trim().length > 0 && !isRecording && !isSendingAudio;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* HEADER INLINE (el layout global tiene header oculto) */}
      <View style={styles.inlineHeaderWrapper}>
        <TouchableOpacity
          style={styles.inlineHeaderContent}
          activeOpacity={0.8}
          onPress={() => otherUser && goToProfile(otherUser.usuarioID)}
        >
          <View style={styles.headerAvatar}>
            {otherUserAvatarUrl ? (
              <Image source={{ uri: otherUserAvatarUrl }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.headerAvatarText}>{getInitials(otherUser)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{headerDisplayName}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
        </TouchableOpacity>

        {otherUser && (
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => goToProfile(otherUser.usuarioID)}
          >
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA DE MENSAJES */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: SPACING.lg }}>
              <Text style={styles.emptyText}>Todavía no hay mensajes.</Text>
            </View>
          ) : null
        }
      />

       {/* CHANGA RELACIONADA (placeholder, luego la conectás) */}
      {/* <RelatedChangaCard /> */}

      {/* INPUT AREA */}
      <View style={styles.inputContainer}>

        {/* INPUT */}
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={handleChangeText}
          multiline
          editable={!isRecording}
        />

        {/* TIMER (solo mientras se graba) */}
        {isRecording && (
          <Text style={styles.recordTimer}>
            {formatDuration(recordingTimeMs)}
          </Text>
        )}

        {/* MIC o STOP cuando no hay texto */}
        {!canSendText ? (
          <TouchableOpacity
            style={[styles.iconButton, isRecording && styles.iconButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isSendingAudio}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={24}
              color={isRecording ? "#b91c1c" : "#555"}
            />
          </TouchableOpacity>
        ) : (
          // BOTÓN DE ENVIAR CUANDO HAY TEXTO
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        )}
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
      overflow: 'hidden',
    },
    headerAvatarImage: {
      width: '100%',
      height: '100%',
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

    inlineHeaderWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FEFB',
    },
    inlineHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
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
      paddingRight: 60, // *** espacio para hora
      borderRadius: 20,
      marginBottom: 2,
      gap: 6,
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

    iconButtonActive: {
        backgroundColor: '#FEE2E2',
        borderRadius: 20,
    },
       sendButtonDisabled: {
        opacity: 0.4,
    },
    recordTimer: {
        color: '#b91c1c',
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 48,
        textAlign: 'center',
    },
    uploadingAudioText: {
        color: '#6B7280',
        fontSize: 12,
        marginHorizontal: 8,
    },
    audioBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      minWidth: 180,
      maxWidth: 260,
    },
    audioPlayButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#34A853',
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioMeta: {
      marginLeft: 10,
    },
    audioLabel: {
      fontWeight: '500',
      fontSize: 14,
    },
    audioDuration: {
      fontSize: 12,
      color: '#555',
    },
    audioButtonDisabled: {
        opacity: 0.5,
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
      maxHeight: 100,
      marginRight: 8, // esto deja espacio antes del botón derecho
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#34A853',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonActive: {
      backgroundColor: '#FEE2E2',
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E6F4EA',
      marginRight: 6,
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
    timestampWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      bottom: 4,
      right: 10,
    },

    timestampInside: {
      fontSize: 11,
      opacity: 0.9,
    },

    timestampRight: {
      color: '#DFF6E4', // para verde
    },

    timestampLeft: {
      color: '#7A7A7A', // para gris
    },
});