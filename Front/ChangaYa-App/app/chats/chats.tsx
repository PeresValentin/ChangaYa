// Front/ChangaYa-App/app/ChatsScreen.js

import React, { useState, useEffect, Component } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Importamos un componente que vamos a crear para cada fila
import ChatListItem, { Chat } from '../../components/ChatListItem';
// Importamos el cliente de Supabase (asumimos que existe)
// import { supabase } from '../utils/supabaseClient'; 

// Datos de ejemplo para la UI (los reemplazaremos con datos de Supabase)
const DUMMY_CHATS = [
    { id: '1', user: 'Ana Martínez', lastMessage: '¡Perfecto! Llego en 15 minutos', time: '10:30', unread: 2 },
    { id: '2', user: 'Carlos López', lastMessage: 'Gracias por la changa! Todo...', time: 'Ayer', unread: 0 },
    // ... más datos
];

const ChatsScreen = ({ navigation }: { navigation: any }) => {
    const [chats, setChats] = useState<typeof DUMMY_CHATS>(DUMMY_CHATS);
    const [searchText, setSearchText] = useState('');

    // **Lógica de Ingeniería (Paso 3): Carga de datos con Supabase**
    // useEffect(() => {
    //     // Función para obtener la lista de chats activos del usuario desde Supabase
    //     const fetchChats = async () => {
    //         // Ejemplo de consulta (deberás adaptarla a tu esquema de BD)
    //         // const { data, error } = await supabase
    //         //     .from('chats')
    //         //     .select('*')
    //         //     .eq('user_id', currentUserId) 
    //         //     .order('last_message_at', { ascending: false });
            
    //         // if (data) setChats(data);
    //         // if (error) console.error("Error al cargar chats:", error);
    //     };
    //     // fetchChats();
    // }, []);


    // Función que se ejecuta cuando el usuario presiona una conversación
    const handleChatPress = (chatId: string) => {
        // Navegar a la pantalla de la conversación individual
        // Tendrás que registrar una pantalla de chat individual (ej. ChatDetailScreen)
        navigation.navigate('ChatDetail', { chatId });
    };

    return (
        <View style={styles.container}>
            {/* Encabezado y Barra de Búsqueda */}
            <Text style={styles.headerTitle}>Chats</Text>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar conversaciones..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                 <TouchableOpacity style={styles.editIconContainer}>
                    <Ionicons name="create-outline" size={24} color="#555" /> 
                </TouchableOpacity>
            </View>

            {/* Lista de Conversaciones */}
            <FlatList
                data={chats.filter(chat => chat.user.toLowerCase().includes(searchText.toLowerCase()))}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatListItem 
                        chat={item} 
                        onPress={() => handleChatPress(item.id)} 
                    />
                )}
                // Separador visual entre elementos de la lista
                ItemSeparatorComponent={() => <View style={styles.separator} />} 
            />
        </View>
    );
};

// ... (Estilos abajo, los podemos refinar después)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50, // Ajuste para iOS/Android
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 25,
        marginHorizontal: 15,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    editIconContainer: {
        padding: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 80, // Alineado para dejar espacio al avatar
    }
});

export default ChatsScreen;