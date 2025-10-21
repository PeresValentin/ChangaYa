// Front/ChangaYa-App/app/chats/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- Datos de Ejemplo ---
// (Reemplazar con tu lógica de Supabase)

// Simulamos los detalles del chat que abrimos
// En la vida real, harías un fetch a Supabase usando el 'id'
const DUMMY_CHAT_DETAILS = {
    id: '1', 
    user: 'Ana Martínez', 
    avatar: 'AM', // Podría ser una URL a una imagen
    online: true,
};

// Simulamos los mensajes de ESE chat
// 'current_user_id' es el ID del usuario logueado (el tuyo)
const DUMMY_MESSAGES: Message[] = [
    { id: 'm1', text: 'Hola! Me interesa la changa de plomería. ¿Todavía está disponible?', time: '10:30', senderId: 'ana_martinez' },
    { id: 'm2', text: '¡Hola Ana! Sí, está disponible. ¿Cuándo podrías venir?', time: '10:32', senderId: 'current_user_id' },
    { id: 'm3', text: 'Puedo ir esta tarde a las 15hs', time: '10:33', senderId: 'ana_martinez' },
    { id: 'm4', text: 'Perfecto! Te espero entonces', time: '10:33', senderId: 'current_user_id' },
    { id: 'm5', text: '¿Cuál es la dirección exacta?', time: '10:35', senderId: 'ana_martinez' },
    { id: 'm6', text: 'Calle 50 y 15, La Plata', time: '10:36', senderId: 'current_user_id', type: 'location' },
    { id: 'm7', text: 'Genial! Llego en 15 minutos', time: '10:36', senderId: 'ana_martinez' },
    { id: 'm8', text: '¡Perfecto! 🚀', time: '10:38', senderId: 'current_user_id' },
];

// --- Tipos (para TypeScript) ---
type Message = {
    id: string;
    text: string;
    time: string;
    senderId: string;
    type?: 'text' | 'location'; // Para mensajes especiales
};

// --- Componente de Burbuja de Mensaje ---
const MessageBubble = ({ message }: { message: Message }) => {
    // Determinamos si el mensaje es del usuario actual
    const isCurrentUser = message.senderId === 'current_user_id';

    // Renderizado especial para la ubicación
    if (message.type === 'location') {
        return (
            <View style={[styles.messageRow, isCurrentUser ? styles.rowRight : styles.rowLeft]}>
                <View style={[styles.messageBubble, isCurrentUser ? styles.bubbleRight : styles.bubbleLeft, styles.locationBubble]}>
                    <Ionicons name="location-sharp" size={20} color={isCurrentUser ? '#fff' : '#333'} />
                    <Text style={[styles.messageText, isCurrentUser ? styles.textRight : styles.textLeft]}>
                        Ubicación compartida
                    </Text>
                    <Text style={[styles.locationText, isCurrentUser ? styles.textRight : styles.textLeft]}>
                        {message.text}
                    </Text>
                </View>
                <Text style={styles.timestamp}>{message.time}</Text>
            </View>
        );
    }
    
    // Renderizado para mensajes de texto
    return (
        <View style={[styles.messageRow, isCurrentUser ? styles.rowRight : styles.rowLeft]}>
            <View style={[styles.messageBubble, isCurrentUser ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.messageText, isCurrentUser ? styles.textRight : styles.textLeft]}>
                    {message.text}
                </Text>
            </View>
            <Text style={styles.timestamp}>{message.time} {isCurrentUser && '✓✓'}</Text>
        </View>
    );
};

// --- Componente de "Changa Relacionada" ---
// (Basado en tu captura)
const RelatedChangaCard = () => (
    <View style={styles.changaCard}>
        <View style={styles.changaIcon}>
            <Ionicons name="build-outline" size={24} color="#34A853" />
        </View>
        <View style={styles.changaDetails}>
            <Text style={styles.changaTitle}>Plomero Urgente</Text>
            <Text style={styles.changaInfo}>$15.000 • A 0.5 km</Text>
        </View>
    </View>
);

// --- Pantalla Principal del Chat ---
const ChatScreen = () => {
    // 1. OBTENER EL ID DEL CHAT
    // 'useLocalSearchParams' lee los parámetros de la URL, en este caso, el '[id]'
    const { id } = useLocalSearchParams();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // 2. LÓGICA DE INGENIERÍA (Carga de Datos)
    useEffect(() => {
        // Aquí harías tu fetch a Supabase
        // const fetchMessages = async () => {
        //     const { data, error } = await supabase
        //         .from('messages')
        //         .select('*')
        //         .eq('chat_id', id) // Usamos el ID de la ruta
        //         .order('created_at', { ascending: false }); // Pedir los más nuevos primero
            
        //     if (data) setMessages(data);
        // }
        // fetchMessages();

        // Por ahora, usamos los datos de ejemplo
        // Invertimos los mensajes para que FlatList (con 'inverted') los muestre correctamente
        setMessages(DUMMY_MESSAGES.slice().reverse()); 

    }, [id]); // Se ejecuta cada vez que el 'id' del chat cambie

    // 3. LÓGICA DE INGENIERÍA (Enviar Mensaje)
    const handleSend = () => {
        if (newMessage.trim() === '') return;

        // Aquí enviarías el mensaje a Supabase
        // const { data, error } = await supabase
        //     .from('messages')
        //     .insert([
        //         { chat_id: id, sender_id: 'current_user_id', text: newMessage }
        //     ]);
        
        // Y aquí lo agregarías al estado local (simulación)
        const sentMessage: Message = {
            id: `m${Math.random()}`,
            text: newMessage,
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            senderId: 'current_user_id'
        };
        // Agregamos el nuevo mensaje al principio (porque la lista está invertida)
        setMessages(prevMessages => [sentMessage, ...prevMessages]);
        setNewMessage('');
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Ajuste fino
        >
            {/* 4. CONFIGURACIÓN DEL HEADER */}
            {/* Usamos Stack.Screen para configurar el header de esta ruta dinámica */}
            <Stack.Screen 
                options={{
                    // Esto recrea el header de tu captura
                    headerTitle: () => (
                        <View style={styles.headerContainer}>
                            <Image style={styles.headerAvatar} source={{ uri: 'https://via.placeholder.com/40' }} /> 
                            <View>
                                <Text style={styles.headerTitle}>{DUMMY_CHAT_DETAILS.user}</Text>
                                <Text style={styles.headerSubtitle}>En línea</Text>
                            </View>
                        </View>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ marginRight: 15 }}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                    headerBackTitle: '', // Esto pone un texto vacío en el botón 'Atrás' de iOS // Oculta el texto "Atrás" en iOS
                    headerShadowVisible: false, // Quita la sombra
                    headerStyle: { backgroundColor: '#F9FEFB' }, // Color de fondo del header
                }}
            />

            {/* 5. LISTA DE MENSAJES */}
            {/* 'inverted' es clave para los chats. 
              Renderiza la lista al revés (del final al principio)
              y los nuevos items se agregan "abajo".
            */}
            <FlatList
                data={messages}
                renderItem={({ item }) => <MessageBubble message={item} />}
                keyExtractor={(item) => item.id}
                style={styles.messageList}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
                inverted // ¡Muy importante para chats!
            />

            {/* 6. TARJETA DE CHANGA RELACIONADA */}
            <RelatedChangaCard />

            {/* 7. BARRA DE ENTRADA */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="mic-outline" size={24} color="#555" />
                </TouchableOpacity>
                <TextInput
                    style={styles.textInput}
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChangeText={setNewMessage}
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
        backgroundColor: '#F9FEFB', // Un blanco-verdoso muy claro
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#E0F0E0' // Placeholder
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
    // Lista de Mensajes
    messageList: {
        flex: 1,
    },
    messageRow: {
        marginBottom: 10,
        maxWidth: '80%',
    },
    rowLeft: {
        alignSelf: 'flex-start',
    },
    rowRight: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end', // Para que el timestamp quede a la derecha
    },
    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 2,
    },
    bubbleLeft: {
        backgroundColor: '#E6E6E6', // Gris claro para el receptor
        borderBottomLeftRadius: 5,
    },
    bubbleRight: {
        backgroundColor: '#34A853', // Verde para el usuario actual
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
    locationBubble: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Changa Card
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
    // Input
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
        maxHeight: 100, // Para que no crezca indefinidamente
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
});