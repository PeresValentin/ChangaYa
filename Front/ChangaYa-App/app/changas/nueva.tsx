// app/changas/nueva.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import theme from '../../constants/theme'; // Importa tu tema

// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// Opciones de ejemplo para la categoría (en el futuro vendrán de BD o config)
const CATEGORIAS = ['Plomería', 'Limpieza', 'Delivery', 'Hogar', 'Mascotas', 'Otros'];

// =========================================================
// COMPONENTE PRINCIPAL DEL FORMULARIO
// =========================================================
const CrearChangaScreen = () => {

    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const router = useRouter();
    const { categoria: categoriaParam } = useLocalSearchParams<{ categoria?: string }>(); 
    const [categoria, setCategoria] = useState<string>(categoriaParam || '');
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

    // TODO: Implementar lógica para guardar borrador
    const handleSaveDraft = () => {
        console.log('Guardar Borrador:', { categoria, titulo, descripcion, precio, esUrgente, fecha, hora, ubicacion, requisitos });
        // Aquí iría la lógica para guardar en AsyncStorage o Supabase como borrador
        // router.back(); // Volver atrás después de guardar
    };

    // TODO: Implementar lógica para publicar la changa
    const handlePublish = async () => {
        // Validaciones básicas
        if (!titulo || !descripcion || !precio) {
            Alert.alert("Campos requeridos", "Por favor completá los campos obligatorios.");
            return;
        }

        try {
            // Obtener token almacenado en AsyncStorage
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
            Alert.alert("Error", "No hay sesión activa. Volvé a iniciar sesión.");
            router.replace("/auth/login");
            return;
            }

            // Construir el payload
            const nuevaChanga = {
            titulo,
            descripcion,
            remuneracion: parseFloat(precio),
            horaInicio: new Date().toISOString(), // Podés ajustarlo con tus campos de fecha/hora reales
            horaFin: new Date().toISOString(),
            };

            console.log("Enviando changa:", nuevaChanga);

            // Hacer la petición POST
            const response = await axios.post(
            `${API_URL}/api/changas`,
            nuevaChanga,
            {
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
            }
            );

            if (response.status === 201 || response.status === 200) {
            Alert.alert("✅ Changa publicada", "Tu changa fue creada con éxito.");
            router.replace("/home/contratante");
            } else {
            Alert.alert("Error", `El servidor respondió con código ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error al publicar changa:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "No se pudo crear la changa");
        }
        };
    
    // TODO: Lógica para añadir un requisito (simplificada)
    const handleAddRequisito = () => {
        if (nuevoRequisito.trim()) {
            setRequisitos([...requisitos, nuevoRequisito.trim()]);
            setNuevoRequisito(''); // Limpiar input (si tuvieras uno visible)
        }
         console.log("Añadir requisito (simulado)"); // Placeholder
    };
    
    // TODO: Lógica para quitar un requisito (opcional)
    const handleRemoveRequisito = (indexToRemove: number) => {
        setRequisitos(requisitos.filter((_, index) => index !== indexToRemove));
    };

    // --- Renderizado ---
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Configuración del Header */}
            <Stack.Screen 
                options={{ 
                    title: 'Crear Changa',
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                }} 
            />

            <ScrollView 
                style={styles.scroll} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled" // Para que el teclado no cierre selects/pickers
            >
                {/* --- Categoría --- */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Categoría *</Text>
                    {/* // TODO: Reemplazar con un componente Picker/Select real */}
                    <TouchableOpacity style={styles.pickerButton}>
                        <Ionicons name="build-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                        <Text style={styles.pickerButtonText}>{categoria}</Text>
                        <Ionicons name="chevron-down" size={20} color={palette.muted} />
                    </TouchableOpacity>
                </View>

                {/* --- Título --- */}
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

                {/* --- Descripción --- */}
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

                {/* --- Precio y Urgente (en fila) --- */}
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

                 {/* --- Fecha y Hora (en fila) --- */}
                 <View style={styles.rowContainer}>
                    <View style={[styles.fieldContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Fecha necesaria *</Text>
                        {/* // TODO: Reemplazar con DateTimePicker */}
                        <TouchableOpacity style={styles.dateButton}>
                            <Ionicons name="calendar-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                            <Text style={styles.dateButtonText}>{fecha}</Text>
                        </TouchableOpacity>
                    </View>
                     <View style={[styles.fieldContainer, { flex: 1 }]}>
                        <Text style={styles.label}>Hora</Text>
                        {/* // TODO: Reemplazar con DateTimePicker */}
                        <TouchableOpacity style={styles.dateButton}>
                             <Ionicons name="time-outline" size={20} color={palette.tint} style={styles.iconLeft} />
                            <Text style={styles.dateButtonText}>{hora}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- Ubicación --- */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Ubicación *</Text>
                     {/* // TODO: Integrar con MapView o Location Picker */}
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

                {/* --- Requisitos (opcional) --- */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Requisitos (opcional)</Text>
                    {requisitos.map((req, index) => (
                        <View key={index} style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={20} color={palette.tint} />
                            <Text style={styles.requirementText}>{req}</Text>
                            {/* Opcional: Botón para quitar */}
                             <TouchableOpacity onPress={() => handleRemoveRequisito(index)} style={styles.removeButton}>
                                <Ionicons name="close-circle" size={20} color={palette.muted} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {/* // TODO: Mostrar un TextInput para añadir nuevo requisito */}
                    <TouchableOpacity style={styles.addRequirementButton} onPress={handleAddRequisito}>
                        <Ionicons name="add-circle-outline" size={20} color={palette.tint} />
                        <Text style={styles.addRequirementText}>Agregar requisito</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

             {/* --- Botones Inferiores --- */}
            <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
                    <Ionicons name="save-outline" size={20} color={palette.tint} />
                    <Text style={styles.draftButtonText}>Guardar borrador</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={palette.white} />
                    <Text style={styles.publishButtonText}>Publicar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.white, // Fondo blanco para el form
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

export default CrearChangaScreen;