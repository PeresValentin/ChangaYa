// Front/ChangaYa-App/components/ChatListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// =========================================================
// 1. INTERFACES (Tipos de datos)
// =========================================================

// Define la estructura (la "forma") de un objeto de Chat
export interface Chat {
    id: string;
    user: string;
    lastMessage: string;
    time: string;
    unread: number;
    // Agregá aquí otras propiedades que uses (ej. avatarUrl, changaTitle)
}

// Define las propiedades (props) que espera el componente ChatListItem
interface ChatListItemProps {
    chat: Chat; // El objeto chat que debe seguir la estructura definida arriba
    onPress: () => void; // Una función que no acepta parámetros y no devuelve nada
}

// =========================================================
// 2. FUNCIÓN DE UTILIDAD
// =========================================================

// Tipado correcto: 'name' es un string, la función devuelve un string
const getInitials = (name: string): string => { 
    const parts = name.split(' ');
    // Aseguramos que haya al menos dos partes para evitar errores, si no, usamos la primera letra
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

// =========================================================
// 3. COMPONENTE PRINCIPAL (Aplicación de los tipos)
// =========================================================

// Usamos React.FC<ChatListItemProps> para aplicar los tipos al componente
const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
    // La desestructuración aquí ya está tipada gracias a ChatListItemProps
    const { user, lastMessage, time, unread } = chat;
    const initials = getInitials(user);

    return (
        <TouchableOpacity style={styles.chatItem} onPress={onPress}>
            {/* Avatar */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Contenido del Chat */}
            <View style={styles.content}>
                <Text style={styles.userName} numberOfLines={1}>{user}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
            </View>

            {/* Metadatos (Hora y No leídos) */}
            <View style={styles.meta}>
                <Text style={styles.time}>{time}</Text>
                {unread > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unread}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

// =========================================================
// 4. ESTILOS
// =========================================================

const styles = StyleSheet.create({
    chatItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#a3e9a4', // Un verde suave de ejemplo
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    content: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    lastMessage: {
        color: '#666',
        fontSize: 14,
        marginTop: 2,
    },
    meta: {
        alignItems: 'flex-end',
        justifyContent: 'center', 
        paddingLeft: 10,
    },
    time: {
        color: '#999',
        fontSize: 12,
        marginBottom: 5,
    },
    badge: {
        backgroundColor: '#4CAF50', 
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default ChatListItem;