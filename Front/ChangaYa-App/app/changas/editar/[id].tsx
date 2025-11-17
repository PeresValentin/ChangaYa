// app/changas/editar.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoading } from '../../../hooks/LoadingContext';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import theme from '../../../constants/theme'; // Importa tu tema
import { SafeAreaView } from 'react-native-safe-area-context';

// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// Opciones de ejemplo para la categoría (en el futuro vendrán de BD o config)
const CATEGORIAS = ['Plomería', 'Limpieza', 'Delivery', 'Hogar', 'Mascotas', 'Otros'];

// =========================================================
// COMPONENTE PRINCIPAL DEL FORMULARIO
// =========================================================
const EditarChangaScreen = () => {

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { showLoading, hideLoading } = useLoading();
    const [categoria, setCategoria] = useState<string>('');
    const [titulo, setTitulo] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [precio, setPrecio] = useState<string>('');
    const [esUrgente, setEsUrgente] = useState<boolean>(false);
    const [fecha, setFecha] = useState<string>('Hoy'); // Placeholder, idealmente un Date
    const [hora, setHora] = useState<string>('10:00 AM'); // Placeholder
    const [ubicacion, setUbicacion] = useState<string>('');
    const [requisitos, setRequisitos] = useState<string[]>([ // Ejemplo inicial
        'Experiencia en plomería',
        'Disponibilidad inmediata',
    ]);
    const [nuevoRequisito, setNuevoRequisito] = useState<string>(''); // Para añadir nuevos

useEffect(() => {
    // 1. Definimos la función async DENTRO del useEffect
    const fetchChangaData = async () => {
        if (!id) {
            Alert.alert("Error", "No se proporcionó un ID de changa.");
            router.back();
            return;
        }
        console.log("Cargando datos para editar changa ID:", id);
        showLoading(); // <-- 2. Mostramos el spinner
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const response = await axios.get(`${API_URL}/api/changas/detalle/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.changa; 
            if (!data) {
                throw new Error("La API no devolvió el objeto 'changa' esperado.");
            }
            // POBLAMOS LOS ESTADOS
            // 'categoria' sigue sin venir en la respuesta de la API.
            // Este campo quedará vacío a menos que el campo se llame distinto.
            setCategoria(data.categoria || ''); 
            setTitulo(data.titulo || ''); // 'titulo' existe
            setDescripcion(data.descripcion || ''); // 'descripcion' existe
            setPrecio(String(data.remuneracion || '')); // 'remuneracion' existe
            setEsUrgente(data.esUrgente || false); // 'esUrgente' existe
            setUbicacion(data.ubicacion || ''); // 'ubicacion' exist
            setRequisitos(data.habilidades || []); // 'habilidades' existe
        } catch (error: any) {
            console.error("Error al cargar la changa:", error.response?.data || error.message);
            Alert.alert("Error al cargar", "No se pudieron obtener los datos de la changa.");
            router.back();
        } finally {
            hideLoading();
        }
    };
    // 6. Llamamos a la función async
    fetchChangaData();
}, [id, API_URL, router]);

    // Función para descartar los cambios y volver
    const handleDiscard = () => {
        Alert.alert(
        "Descartar cambios",
            "¿Estás seguro de que querés salir? Perderás todo lo que escribiste.",
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Salir", style: "destructive", onPress: () => router.back() }
        ]
            );
    };

// Función para guardar los cambios (¡CON CONFIRMACIÓN!)
    const handleSaveChanges = () => { // <-- 1. La función principal ya no es 'async'
        // 2. Mostramos la alerta de confirmación PRIMERO
        Alert.alert(
            "Guardar Cambios", // Título de la alerta
            "Estas seguro que deseas guardar los cambios? esto te hara perder puntos!", // Tu mensaje
            [
                {
                    text: "Cancelar", // Botón 1: No hace nada
                    style: "cancel",
                },
                {
                    text: "Guardar", // Botón 2: Guarda los cambios
                    style: "destructive", // Estilo rojo (ya que "pierde puntos")
                    // 3. ¡TODA la lógica de guardado (async) ahora va AQUÍ DENTRO!
                    onPress: async () => {
                        // Validaciones básicas
                        if (!titulo || !descripcion || !precio) {
                            Alert.alert("Campos requeridos", "Por favor completá los campos obligatorios.");
                            return;
                        }
                        // (Aquí podés llamar a showLoading() si tenés el hook)
                        try {
                            const token = await AsyncStorage.getItem("jwtToken");
                            if (!token) {
                                Alert.alert("Error", "No hay sesión activa.");
                                router.replace("/auth/login");
                                return;
                            }
                            const changaActualizada = {
                                titulo,
                                descripcion,
                                remuneracion: parseFloat(precio),
                                // ... (otros campos)
                            };
                            console.log("Actualizando changa ID:", id, changaActualizada);
                            const response = await axios.put(
                                `${API_URL}/api/changas/${id}`,
                                changaActualizada,
                                {
                                    headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (!id || typeof id !== 'string') {
                        Alert.alert("Error de ID", "No se encontró el ID de la changa para guardar.");
                        // Si tenés un 'hideLoading()', ponelo acá también
                        return; // Cortamos la ejecución si el id no es válido
                        }
                            if (response.status === 200) {
                                Alert.alert("✅ Changa Actualizada", "Tus cambios se guardaron con éxito.");
                                router.replace({
                                pathname: "/changas/[id]",
                                params: { id: id, viewMode: "contratante" } // Pasá los mismos params que ya tenías
                            });
                            } else {
                                Alert.alert("Error", `El servidor respondió con código ${response.status}`);
                        }
                        } catch (error: any) {
                            console.error("Error al actualizar changa:", error.response?.data || error.message);
                            Alert.alert("Error", error.response?.data?.error || "No se pudo guardar los cambios");
                        } finally {
                            // (Aquí podés llamar a hideLoading() si lo usaste)
                        }
                    },
                },
            ]
        );
    };
        // Lógica para añadir un requisito (simplificada)
    const handleAddRequisito = () => {
        if (nuevoRequisito.trim()) {
            setRequisitos([...requisitos, nuevoRequisito.trim()]);
            setNuevoRequisito(''); // Limpiar input (si tuvieras uno visible)
        } else {
            // Opcional: podés poner una alerta si el campo está vacío
            console.log("El requisito no puede estar vacío");
        }
    };
    
    // TODO: Lógica para quitar un requisito (opcional)
    const handleRemoveRequisito = (indexToRemove: number) => {
        setRequisitos(requisitos.filter((_, index) => index !== indexToRemove));
    };

    // --- Renderizado ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    title: 'Editar Changa',
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                }} 
            />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer} // Usamos un estilo nuevo
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

            <ScrollView 
                style={styles.scroll} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled" // Para que el teclado no cierre selects/pickers
            >
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Categoría *</Text>
                    <TouchableOpacity style={styles.pickerButton}>
                        <Ionicons name="build-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                        <Text style={styles.pickerButtonText}>{categoria}</Text>
                        <Ionicons name="chevron-down" size={20} color={palette.muted} />
                    </TouchableOpacity>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Título *</Text>
                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Reparación de canilla"
                        placeholderTextColor={palette.muted}
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Descripción *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        placeholder="Describe el trabajo detalladamente..."
                        placeholderTextColor={palette.muted}
                        multiline
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{descripcion.length}/500</Text>
                </View>

                <View style={styles.rowContainer}>
                    <View style={[styles.fieldContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Precio ofrecido *</Text>
                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={[styles.input, styles.priceInput]}
                                value={precio}
                                onChangeText={setPrecio}
                                placeholder="15.000"
                                placeholderTextColor={palette.muted}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={styles.urgentContainer}>
                        <Text style={styles.label}>¿Es urgente?</Text>
                        <Switch
                            trackColor={{ false: palette.border, true: palette.tint }}
                            thumbColor={palette.white}
                            ios_backgroundColor={palette.border}
                            onValueChange={setEsUrgente}
                            value={esUrgente}
                            style={styles.switch}
                        />
                    </View>
                </View>

                 <View style={styles.rowContainer}>
                    <View style={[styles.fieldContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Fecha necesaria *</Text>
                        <TouchableOpacity style={styles.dateButton}>
                            <Ionicons name="calendar-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                            <Text style={styles.dateButtonText}>{fecha}</Text>
                        </TouchableOpacity>
                    </View>
                     <View style={[styles.fieldContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Hora</Text>
                        <TouchableOpacity style={styles.dateButton}>
                             <Ionicons name="time-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                            <Text style={styles.dateButtonText}>{hora}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Ubicación *</Text>
                    <View style={styles.locationInputContainer}>
                         <Ionicons name="location-outline" size={20} color={palette.muted} style={styles.iconLeft} />
                        <TextInput
                            style={[styles.input, { paddingRight: 35 }]} // Espacio para el pin
                            value={ubicacion}
                            onChangeText={setUbicacion}
                            placeholder="Calle 50 y 15, La Plata"
                            placeholderTextColor={palette.muted}
                        />
                         <TouchableOpacity style={styles.locationPin}>
                            <Ionicons name="navigate-circle-outline" size={24} color={palette.tint} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Requisitos (opcional)</Text>
                    {requisitos.map((req, index) => (
                        <View key={index} style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={20} color={palette.tint} />
                            <Text style={styles.requirementText}>{req}</Text>
                             <TouchableOpacity onPress={() => handleRemoveRequisito(index)} style={styles.removeButton}>
                                <Ionicons name="close-circle" size={20} color={palette.muted} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addRequirementButton} onPress={handleAddRequisito}>
                        <Ionicons name="add-circle-outline" size={20} color={palette.tint} />
                        <Text style={styles.addRequirementText}>Agregar requisito</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.draftButton} onPress={handleDiscard}>
                    <Ionicons name="close-outline" size={20} color={palette.tint} />
                    <Text style={styles.draftButtonText}>Descartar Cambios</Text> 
                </TouchableOpacity>
                <TouchableOpacity style={styles.publishButton} onPress={handleSaveChanges}>
                    <Ionicons name="save-outline" size={20} color={palette.white} />
                    <Text style={styles.publishButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
            </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: palette.white, // Fondo blanco para el form
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scroll: {
      flex: 1,
    },
  scrollContent: {
      padding: SPACING.lg,
      paddingBottom: SPACING.lg * 5, // Espacio para botones fijos
  },
  fieldContainer: {
      marginBottom: SPACING.md,
  },
  label: {
      fontSize: FONT.md,
      fontWeight: '600' as const,
      color: palette.text,
      marginBottom: SPACING.xs,
  },
  input: {
      backgroundColor: palette.background, // Gris claro
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      fontSize: FONT.md,
      color: palette.text,
      borderWidth: 1,
      borderColor: palette.border,
  },
  textArea: {
      height: 100, // Altura inicial
      textAlignVertical: 'top', // Para que el texto empiece arriba en Android
  },
  charCount: {
      fontSize: FONT.sm,
      color: palette.muted,
      textAlign: 'right',
      marginTop: SPACING.xs,
  },
  // --- Estilos específicos ---
  pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2, // Un poco más alto
      borderWidth: 1,
      borderColor: palette.border,
  },
  pickerButtonText: {
      flex: 1,
      fontSize: FONT.md,
      color: palette.text,
      marginLeft: SPACING.sm,
  },
  iconLeft: {
      marginRight: SPACING.sm,
  },
  rowContainer: {
      flexDirection: 'row',
      gap: SPACING.md,
      alignItems: 'flex-end', // Para alinear el switch con el input
  },
  priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
      fontSize: FONT.md,
      color: palette.muted,
      marginRight: SPACING.xs,
  },
  priceInput: {
      flex: 1,
      borderWidth: 0, // Quitamos borde del input interno
      paddingVertical: SPACING.sm, // Ajuste vertical
      backgroundColor: 'transparent',
  },
  urgentContainer: {
      alignItems: 'center',
      paddingBottom: SPACING.sm, // Para alinear verticalmente aprox
  },
  switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], // Hacerlo un poco más grande
      marginTop: SPACING.xs,
  },
  dateButton: {
       flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      borderWidth: 1,
      borderColor: palette.border,
  },
  dateButtonText: {
       flex: 1,
      fontSize: FONT.md,
      color: palette.text,
  },
  locationInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: palette.border,
      paddingLeft: SPACING.md, // Solo padding izquierdo
  },
  locationPin: {
      position: 'absolute',
      right: SPACING.sm,
      padding: 5,
  },
  requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      padding: SPACING.sm,
      borderRadius: RADIUS.sm,
      marginBottom: SPACING.xs,
      gap: SPACING.sm,
  },
  requirementText: {
      flex: 1,
      fontSize: FONT.sm,
      color: palette.text,
  },
  removeButton: {
      padding: 4, // Área de toque
  },
  addRequirementButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
      padding: SPACING.xs,
      gap: SPACING.xs,
  },
  addRequirementText: {
      fontSize: FONT.sm,
      color: palette.tint,
      fontWeight: '600' as const,
  },
  // --- Botones Inferiores ---
  footerButtons: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      backgroundColor: palette.white,
      padding: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      gap: SPACING.md,
  },
  draftButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.white,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      borderColor: palette.tint,
      gap: SPACING.sm,
  },
  draftButtonText: {
      color: palette.tint,
      fontSize: FONT.md,
      fontWeight: 'bold',
  },
  publishButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      gap: SPACING.sm,
      elevation: 3,
  },
  publishButtonText: {
      color: palette.white,
      fontSize: FONT.md,
      fontWeight: 'bold',
  },
});

export default EditarChangaScreen;