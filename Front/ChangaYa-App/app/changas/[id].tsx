// app/changas/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Hooks de Expo Router para leer parámetros y configurar el header
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import theme from '../../constants/theme'; // Importamos tu tema

// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// =========================================================
// INTERFACE Y DATOS DE EJEMPLO (Reemplazar con Supabase)
// =========================================================
interface JobDetails {
    id: string;
    title: string;
    urgent: boolean;
    price: string;
    distance: string;
    schedule: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    requirements: string[];
    contractor: {
        initials: string;
        name: string;
        rating: number;
        reviews: number;
        memberSince: string;
    };
    location: {
        address: string;
        walkingTime: string;
    };
}

// Datos hardcodeados basados en tu PDF/PNG
const DUMMY_JOB_DETAILS: JobDetails = {
    id: 'plomero-urgente',
    title: 'Plomero Urgente',
    urgent: true,
    price: '$15.000',
    distance: 'A 0.5 km de tu ubicación',
    schedule: 'Necesario hoy',
    icon: 'build-outline', 
    description: 'Se rompió la canilla del baño y está perdiendo mucha agua. Necesito que alguien venga hoy mismo a arreglarlo. Tengo todas las herramientas necesarias.',
    requirements: [
        'Experiencia en plomería',
        'Disponibilidad inmediata',
        'Herramientas propias (opcional)',
    ],
    contractor: {
        initials: 'MR',
        name: 'María Rodríguez',
        rating: 4.8,
        reviews: 32,
        memberSince: 'marzo 2023',
    },
    location: {
        address: 'Calle 50 y 15, La Plata',
        walkingTime: '6 minutos caminando desde tu ubicación',
    },
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
const JobDetailsScreen = () => {
    const router = useRouter();
    // 1. Obtenemos el 'id' de la URL usando Expo Router
    const { id, viewMode } = useLocalSearchParams<{ id?: string, viewMode?: string }>(); // <-- MODIFICADO 
    
    // Estado para guardar los detalles de la changa
    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Lógica de Ingeniería: Cargar datos reales (futuro)
    useEffect(() => {
        // Simula la carga de datos
        const loadJobDetails = async () => {
            setIsLoading(true);
            console.log("Cargando detalles para la changa con ID:", id);
            // --- AQUÍ IRÍA TU FETCH A SUPABASE ---
            // Ejemplo:
            // const { data, error } = await supabase
            //    .from('changas')
            //    .select(`
            //        *, 
            //        contratante: contratante_id ( nombre, iniciales, rating, fecha_registro ) 
            //    `)
            //    .eq('id', id)
            //    .single(); 
            // if (data) {
            //     // Mapear 'data' a la estructura de 'JobDetails'
            //     setJobDetails(mapSupabaseDataToJobDetails(data)); 
            // } else {
            //     console.error("Error cargando changa:", error);
            //     // Manejar error (ej. mostrar mensaje)
            // }
            // ------------------------------------

            // Por ahora, usamos los datos de ejemplo después de una pequeña demora
            setTimeout(() => {
                setJobDetails(DUMMY_JOB_DETAILS);
                setIsLoading(false);
            }, 500); // Simula 0.5s de carga
        };

        if (id) {
            loadJobDetails();
        } else {
             // Manejar caso donde no hay ID (no debería pasar si la navegación es correcta)
             setIsLoading(false);
        }

    }, [id]); // El efecto se ejecuta si el 'id' cambia

    // --- Renderizado Condicional ---
    if (isLoading) {
        // Podrías mostrar un spinner aquí
        return <SafeAreaView style={styles.safeArea}><Text style={styles.loadingText}>Cargando...</Text></SafeAreaView>;
    }

    if (!jobDetails) {
        // Mostrar mensaje si no se encontraron datos
        return <SafeAreaView style={styles.safeArea}><Text style={styles.loadingText}>No se encontraron detalles para esta changa.</Text></SafeAreaView>;
    }

    // --- Renderizado Principal ---
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 3. Configuración del Header (usando Stack.Screen) */}
            <Stack.Screen
                options={{
                    title: 'Detalles de la Changa', // Título en la barra
                    headerTitleAlign: 'center', // Centrar título
                    headerShadowVisible: false, // Quitar sombra (opcional)
                    headerRight: () => ( // Botón de corazón a la derecha
                        <TouchableOpacity style={{ marginRight: SPACING.md }}>
                            <Ionicons name="heart-outline" size={24} color={palette.tint} />
                        </TouchableOpacity>
                    ),
                    // El botón de "atrás" es automático en Stack
                }}
            />

            <ScrollView 
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {/* --- Tarjeta Resumen --- */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconWrapper}>
                        <Ionicons name={jobDetails.icon} size={30} color={palette.tint} />
                    </View>
                    <View style={styles.summaryInfo}>
                        <View style={styles.summaryTitleRow}>
                            <Text style={styles.summaryTitle}>{jobDetails.title}</Text>
                            {jobDetails.urgent && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentText}>URGENTE</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.summaryPrice}>{jobDetails.price}</Text>
                        <View style={styles.summaryMetaRow}>
                            <Ionicons name="location-outline" size={14} color={palette.muted} />
                            <Text style={styles.summaryMetaText}>{jobDetails.distance}</Text>
                        </View>
                        <View style={styles.summaryMetaRow}>
                            <Ionicons name="calendar-outline" size={14} color={palette.muted} />
                            <Text style={styles.summaryMetaText}>{jobDetails.schedule}</Text>
                        </View>
                    </View>
                </View>

                {/* --- Descripción --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.bodyText}>{jobDetails.description}</Text>
                </View>

                {/* --- Requisitos --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requisitos</Text>
                    {jobDetails.requirements.map((req, index) => (
                        <View key={index} style={styles.requirementRow}>
                            <Ionicons name="checkmark-circle-outline" size={18} color={palette.tint} />
                            <Text style={styles.bodyText}>{req}</Text>
                        </View>
                    ))}
                </View>

                {/* --- Contratante --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contratante</Text>
                    <View style={styles.contractorCard}>
                        <View style={styles.contractorAvatar}>
                            <Text style={styles.contractorInitials}>{jobDetails.contractor.initials}</Text>
                        </View>
                        <View style={styles.contractorInfo}>
                            <Text style={styles.contractorName}>{jobDetails.contractor.name}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#FFC107" />
                                <Text style={styles.ratingText}>
                                    {jobDetails.contractor.rating} ({jobDetails.contractor.reviews} reseñas)
                                </Text>
                            </View>
                            <Text style={styles.memberSinceText}>
                                Miembro desde {jobDetails.contractor.memberSince}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.profileButton}
                            // onPress={() => router.push(`/profile/${contractorId}`)} // Futura navegación
                        >
                            <Text style={styles.profileButtonText}>Ver perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- Ubicación --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    <View style={styles.locationCard}>
                        <Ionicons name="location-sharp" size={20} color={palette.tint} style={{ marginRight: SPACING.sm }}/>
                        <View>
                            <Text style={styles.addressText}>{jobDetails.location.address}</Text>
                            <View style={styles.walkingRow}>
                                <Ionicons name="walk-outline" size={16} color={palette.muted} />
                                <Text style={styles.walkingText}>{jobDetails.location.walkingTime}</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* --- Botones de Acción Fijos Abajo --- */}
{/* --- Botones de Acción Fijos Abajo (CONDICIONAL) --- */}
            <View style={styles.footer}>
                {viewMode === 'contratante' ? (
                    // --- VISTA CONTRATANTE: Botón Editar ---
                    <TouchableOpacity 
                        style={styles.actionButtonPrimary} // Usamos el estilo verde primario
                        // onPress={() => router.push(`/changas/editar/${jobDetails?.id}`)} // Futura navegación a editar
                    >
                        <Ionicons name="create-outline" size={20} color={palette.white} />
                        <Text style={styles.actionButtonTextPrimary}>Editar</Text>
                    </TouchableOpacity>
                ) : (
// --- VISTA TRABAJADOR: Botones Consultar y Postularme ---
                    <> 
                        {/* Botón para iniciar una consulta por chat */}
                        <TouchableOpacity 
                            style={styles.actionButtonSecondary}
                            // onPress={() => router.push(`/chats/new?userId=${jobDetails?.contractor.id}`)} // TODO: Implementar navegación a chat
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={palette.tint} />
                            <Text style={styles.actionButtonTextSecondary}>Consultar</Text>
                        </TouchableOpacity>
                        
                        {/* Botón para postularse a la changa */}
                        <TouchableOpacity 
                            style={styles.actionButtonPrimary}
                            // onPress={handlePostularse} // TODO: Implementar lógica de postulación
                        >
                            <Ionicons name="hand-right-outline" size={20} color={palette.white} />
                            <Text style={styles.actionButtonTextPrimary}>Postularme</Text>
                        </TouchableOpacity>
                    </>
                    )
                }
            </View>
            
            {/* --- Tip (CONDICIONAL) --- */}
            {/* Mostramos el tip solo si NO es el contratante */}
            {viewMode !== 'contratante' && ( 
                 <Text style={styles.tipText}>
                    💡 Tip: Las respuestas rápidas aumentan tus posibilidades de ser seleccionado
                </Text>
            )}
        </SafeAreaView>
    );
};

// =========================================================
// ESTILOS (Basados en el diseño y tu theme)
// =========================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
      flex: 1,
  },
  scrollContent: {
      padding: SPACING.lg,
      paddingBottom: SPACING.lg * 6, // Espacio para botones fijos y tip
  },
  loadingText: {
      textAlign: 'center',
      marginTop: SPACING.lg,
      fontSize: FONT.md,
      color: palette.muted,
  },
  // --- Tarjeta Resumen ---
  summaryCard: {
      flexDirection: 'row',
      backgroundColor: palette.tabIconSelected, // Celeste claro
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      gap: SPACING.md,
  },
  summaryIconWrapper: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.md,
      backgroundColor: palette.white,
      alignItems: 'center',
      justifyContent: 'center',
  },
  summaryInfo: {
      flex: 1,
  },
  summaryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
  },
  summaryTitle: {
      fontSize: FONT.lg,
      fontWeight: '700' as const,
      color: palette.icon,
      marginRight: SPACING.xs,
  },
  urgentBadge: {
      backgroundColor: '#F44336', // Rojo
      borderRadius: RADIUS.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
  },
  urgentText: {
      color: palette.white,
      fontSize: 10,
      fontWeight: 'bold',
  },
  summaryPrice: {
      fontSize: FONT.md,
      fontWeight: '600' as const,
      color: palette.icon,
      marginBottom: SPACING.xs,
  },
  summaryMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
  },
  summaryMetaText: {
      fontSize: FONT.sm,
      color: palette.muted,
  },
  // --- Secciones Generales ---
  section: {
      marginBottom: SPACING.lg,
  },
  sectionTitle: {
      fontSize: FONT.lg,
      fontWeight: '700' as const,
      color: palette.icon,
      marginBottom: SPACING.sm,
  },
  bodyText: {
      fontSize: FONT.md,
      color: palette.text, // Usar un color de texto estándar
      lineHeight: FONT.md * 1.5,
  },
  // --- Requisitos ---
  requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
  },
  // --- Contratante ---
  contractorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.white,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: palette.border,
      gap: SPACING.md,
  },
  contractorAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: palette.tabIconSelected, // Celeste
      alignItems: 'center',
      justifyContent: 'center',
  },
  contractorInitials: {
      fontSize: FONT.lg,
      fontWeight: 'bold',
      color: palette.tint, // Verde
  },
  contractorInfo: {
      flex: 1,
  },
  contractorName: {
      fontSize: FONT.md,
      fontWeight: '700' as const,
      color: palette.icon,
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginVertical: 2,
  },
  ratingText: {
      fontSize: FONT.sm,
      color: palette.muted,
  },
  memberSinceText: {
      fontSize: FONT.sm,
      color: palette.muted,
  },
  profileButton: {
      backgroundColor: palette.background,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: palette.border,
  },
  profileButtonText: {
      fontSize: FONT.sm,
      fontWeight: '600' as const,
      color: palette.tint,
  },
  // --- Ubicación ---
  locationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.white,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: palette.border,
  },
  addressText: {
      fontSize: FONT.md,
      fontWeight: '600' as const,
      color: palette.icon,
  },
  walkingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
  },
  walkingText: {
      fontSize: FONT.sm,
      color: palette.muted,
  },
  // --- Footer y Botones ---
  footer: {
      position: 'absolute',
      bottom: SPACING.lg + 30, // Deja espacio para el tip
      left: SPACING.lg,
      right: SPACING.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.md,
      paddingVertical: SPACING.sm, // Añadido para que no se pegue al tip
      backgroundColor: palette.background, // Para tapar contenido si scroll llega al fondo
  },
  actionButtonPrimary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint, // Verde
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      gap: SPACING.sm,
      elevation: 3,
  },
  actionButtonTextPrimary: {
      color: palette.white,
      fontSize: FONT.md,
      fontWeight: 'bold',
  },
  actionButtonSecondary: {
       flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.white, // Blanco
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      gap: SPACING.sm,
      borderWidth: 1.5,
      borderColor: palette.tint, // Borde Verde
  },
  actionButtonTextSecondary: {
      color: palette.tint, // Verde
      fontSize: FONT.md,
      fontWeight: 'bold',
  },
  // --- Tip ---
  tipText: {
      position: 'absolute',
      bottom: SPACING.md,
      left: SPACING.lg,
      right: SPACING.lg,
      fontSize: FONT.sm,
      color: palette.muted,
      textAlign: 'center',
  },
});

export default JobDetailsScreen;