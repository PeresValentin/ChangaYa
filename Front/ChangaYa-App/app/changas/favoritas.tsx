// app/favoritas.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import theme from '../../constants/theme'; // Ajusta la ruta si es necesario

// =========================================================
// CONSTANTES Y TIPOS
// =========================================================

// Constantes del tema para estilos consistentes
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

// Tipos para el estado del filtro y las changas favoritas
type FavoriteStatus = 'abierta' | 'postulada' | 'finalizada';

interface FavoriteChanga {
    id: string;
    title: string;
    distance: string;
    price: string;
    schedule: string;
    status: FavoriteStatus;
    urgent?: boolean;
    rating?: string; // Ej: "4.9 (12 reviews)" o "4.8"
    icon: keyof typeof Ionicons.glyphMap;
    location?: string; // Ej: "Centro"
}

// =========================================================
// DATOS DE EJEMPLO (Reemplazar con datos reales de Supabase)
// =========================================================
const MIS_FAVORITAS: FavoriteChanga[] = [
    {
        id: 'plomero-urg',
        title: 'Plomero Urgente',
        distance: 'A 0.5 km',
        price: '$15.000',
        schedule: 'Necesario hoy',
        status: 'abierta',
        urgent: true,
        icon: 'build-outline'
    },
    {
        id: 'limpieza-prof',
        title: 'Limpieza Profunda',
        distance: 'A 1.8 km',
        price: '$12.000',
        schedule: 'Para mañana',
        status: 'abierta',
        rating: '4.9 (12 reviews)',
        icon: 'home-outline'
    },
    {
        id: 'delivery-centro',
        title: 'Delivery Centro',
        distance: 'A 2.1 km',
        price: '$8.000',
        schedule: 'Para hoy',
        status: 'postulada',
        icon: 'cube-outline'
    },
    {
        id: 'reparacion-grifo',
        title: 'Reparación Grifo',
        distance: 'Centro',
        price: '$10.000',
        schedule: 'Completada el 15/09',
        status: 'finalizada',
        rating: '4.8',
        icon: 'build-outline'
    },
];

// =========================================================
// CONFIGURACIÓN DE NAVEGACIÓN INFERIOR (Copiada y adaptada)
// =========================================================
const quickLinks: {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: Href;
}[] = [
    { id: "home", title: "Inicio", icon: "home-outline" as const, route: "/home/trabajador" as Href },
    {
        id: "chats",
        title: "Chats",
        icon: "chatbubble-ellipses-outline" as const,
        route: "/chats" as Href,
    },
    {
        id: "favoritas", // ID y ruta actualizados para esta pantalla
        title: "Favoritas",
        icon: "heart-outline" as const, // Ícono de corazón
        route: "/favoritas" as Href,
    },
    {
        id: "perfil",
        title: "Perfil",
        icon: "person-circle-outline" as const,
        route: "/profile" as Href,
    },
];

// =========================================================
// COMPONENTE AUXILIAR: TARJETA DE CHANGA FAVORITA
// =========================================================
const FavoriteJobCard: React.FC<{ changa: FavoriteChanga }> = ({ changa }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.favCard}
            // Navega a la pantalla de detalles pasando ID y modo de vista
            onPress={() => router.push({ pathname: "/changas/[id]", params: { id: changa.id, viewMode: 'trabajador' }})}
        >
            {/* Ícono de la categoría */}
            <View style={styles.favCardIconWrapper}>
                <Ionicons name={changa.icon} size={22} color={palette.tint} />
            </View>

            {/* Información principal de la changa */}
            <View style={styles.favCardInfo}>
                <Text style={styles.favCardTitle}>{changa.title}</Text>
                {/* Fila con distancia y precio */}
                <View style={styles.favMetaRow}>
                    <Ionicons name="location-outline" size={14} color={palette.muted} />
                    <Text style={styles.favMetaText}>{changa.distance}</Text>
                    <Ionicons name="cash-outline" size={14} color={palette.muted} style={{ marginLeft: SPACING.sm }}/>
                    <Text style={styles.favMetaText}>{changa.price}</Text>
                </View>
                {/* Fila con horario o estado de finalización */}
                <View style={styles.favMetaRow}>
                    <Ionicons name={changa.status === 'finalizada' ? "checkmark-circle-outline" : "time-outline"} size={14} color={palette.muted} />
                    <Text style={styles.favMetaText}>{changa.schedule}</Text>
                </View>
                {/* Muestra el rating si está disponible */}
                {changa.rating && (
                    <View style={styles.favMetaRow}>
                        <Ionicons name="star" size={14} color="#FFC107"/>
                        <Text style={styles.favMetaText}>{changa.rating}</Text>
                    </View>
                )}
                {/* Badge "URGENTE" si aplica */}
                {changa.urgent && (
                    <View style={[styles.favBadgeBase, styles.favBadgeUrgent]}>
                        <Text style={styles.favBadgeTextUrgent}>URGENTE</Text>
                    </View>
                )}
                {/* Badge "POSTULADO" si aplica */}
                {changa.status === 'postulada' && (
                    <View style={[styles.favBadgeBase, styles.favBadgePostulado]}>
                        <Text style={styles.favBadgeTextPostulado}>POSTULADO</Text>
                    </View>
                )}
            </View>
            {/* Botón de corazón (para quitar de favoritos en el futuro) */}
            <TouchableOpacity style={styles.favHeartButton}>
                <Ionicons name="heart" size={24} color={palette.tint}/>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// =========================================================
// COMPONENTE PRINCIPAL DE LA PANTALLA "MIS FAVORITAS"
// =========================================================
export default function MisFavoritasScreen() {
    const router = useRouter();
    const pathname = usePathname();
    // Estado para controlar qué filtro está activo ('abierta', 'postulada', 'finalizada')
    const [activeFilter, setActiveFilter] = useState<FavoriteStatus>('abierta');

    // --- Lógica de Filtrado y Agrupación ---
    // Filtra la lista completa según el botón presionado
    const filteredFavoritas = useMemo(() => {
        return MIS_FAVORITAS.filter(fav => fav.status === activeFilter);
    }, [activeFilter]);

    // Pre-calcula las listas agrupadas por estado (para mostrar secciones)
    const favoritasAbiertas = useMemo(() => MIS_FAVORITAS.filter(f => f.status === 'abierta'), []);
    const favoritasPostuladas = useMemo(() => MIS_FAVORITAS.filter(f => f.status === 'postulada'), []);
    const favoritasFinalizadas = useMemo(() => MIS_FAVORITAS.filter(f => f.status === 'finalizada'), []);

    // Calcula los contadores para los títulos de sección
    const countAbiertas = favoritasAbiertas.length;
    const countPostuladas = favoritasPostuladas.length;
    const countFinalizadas = favoritasFinalizadas.length;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Configuración del Header (Título y botón derecho) */}
            <Stack.Screen
                options={{
                    title: 'Mis Favoritas',
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity style={{ marginRight: SPACING.md }}>
                            <Ionicons name="search-outline" size={24} color={palette.icon} />
                        </TouchableOpacity>
                    ),
                }}
            />
            {/* Contenedor principal */}
            <View style={styles.container}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Botones de Filtro (Abiertas, Postuladas, Finalizadas) */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'abierta' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('abierta')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'abierta' && styles.filterTextActive]}>Abiertas</Text>
                        </TouchableOpacity>
                        {/* *
                          * CORRECCIÓN 1: Se agrega {} para consumir el 
                          * espacio en blanco / salto de línea.
                          *
                          */}
                        {}
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'postulada' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('postulada')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'postulada' && styles.filterTextActive]}>Postuladas</Text>
                        </TouchableOpacity>
                        {/* *
                          * CORRECCIÓN 2: Se agrega {} aquí también.
                          *
                          */}
                        {}
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'finalizada' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('finalizada')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'finalizada' && styles.filterTextActive]}>Finalizadas</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lista de Tarjetas Favoritas (Renderizado Condicional) */}
                    <View style={styles.cardList}>
                        {/* Sección Abiertas */}
                        {activeFilter === 'abierta' && favoritasAbiertas.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Changas abiertas ({countAbiertas})</Text>
                                {/* Mapea y renderiza cada tarjeta favorita abierta */}
                                {favoritasAbiertas.map(fav => <FavoriteJobCard key={fav.id} changa={fav} />)}
                            </View>
                        )}
                        {/* Sección Postuladas */}
                        {activeFilter === 'postulada' && favoritasPostuladas.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Postuladas - aún abiertas ({countPostuladas})</Text>
                                {/* Mapea y renderiza cada tarjeta favorita postulada */}
                                {favoritasPostuladas.map(fav => <FavoriteJobCard key={fav.id} changa={fav} />)}
                            </View>
                        )}
                        {/* Sección Finalizadas */}
                        {activeFilter === 'finalizada' && favoritasFinalizadas.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Finalizadas ({countFinalizadas})</Text>
                                {/* Mapea y renderiza cada tarjeta favorita finalizada */}
                                {favoritasFinalizadas.map(fav => <FavoriteJobCard key={fav.id} changa={fav} />)}
                            </View>
                        )}
                        {/* Mensaje si no hay resultados en el filtro activo */}
                        {filteredFavoritas.length === 0 && (
                            <Text style={styles.noJobsText}>No tienes changas favoritas en estado "{activeFilter}".</Text>
                        )}
                    </View>

                    {/* Tip informativo */}
                    <View style={styles.tipContainer}>
                        <Ionicons name="bulb-outline" size={20} color={palette.muted} />
                        {/* *
                          * CORRECCIÓN 3: Se agrega {} para consumir el 
                          * espacio en blanco / salto de línea entre el ícono y el texto.
                          *
                          */}
                        {}
                        <Text style={styles.tipText}>
                            {/* También es buena práctica envolver el texto en {'...'} 
                                para evitar problemas con la indentación interna. */}
                            {'Marca changas como favoritas para encontrarlas fácilmente aquí'}
                        </Text>
                    </View>

                </ScrollView>

                {/* Barra de navegación inferior (Manual) */}
                <View style={styles.bottomNav}>
                    {quickLinks.map((item) => {
                        const routePath = typeof item.route === "string" ? item.route : (item.route as any)?.pathname ?? String(item.route);
                        // Lógica para determinar qué botón está activo
                        const isHomeActive = item.id === "home" && pathname.startsWith("/home/trabajador");
                        const isFavoritasActive = item.id === "favoritas" && pathname.startsWith('/favoritas');
                        const isActive = isHomeActive || isFavoritasActive || (item.id !== "home" && item.id !== "favoritas" && (pathname === routePath || pathname.startsWith(`${routePath}/`)));

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.navItem, isActive && styles.navItemActive]}
                                // Navega a la ruta correspondiente al botón
                                onPress={() => router.push(item.route)}
                            >
                                <Ionicons
                                    name={item.icon}
                                    size={22}
                                    color={isActive ? palette.tint : palette.icon}
                                />
                                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                                    {item.title}
                                </Text>
                                {/* Indicador visual para el botón activo */}
                                {isActive ? <View style={styles.activeIndicator} /> : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

// =========================================================
// ESTILOS (Combinación y adaptación)
// =========================================================
const styles = StyleSheet.create({
    // --- Layout ---
    safeArea: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.lg * 6 }, // Espacio para barra inferior

    // --- Filtros ---
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    filterButton: {
        paddingVertical: SPACING.xs + 2,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: palette.border,
    },
    filterButtonActive: {
        backgroundColor: palette.tint, // Verde activo
        borderColor: palette.tint,
    },
    filterText: {
        fontSize: FONT.sm,
        color: palette.muted,
        fontWeight: '500' as const,
    },
    filterTextActive: {
        color: palette.white,
        fontWeight: '700' as const,
    },

    // --- Secciones y Títulos ---
    sectionContainer: {
        marginBottom: SPACING.lg,
    },
     sectionTitle: {
        fontSize: FONT.md, // Título de sección más chico
        fontWeight: "600" as const,
        color: palette.icon,
        marginBottom: SPACING.sm,
    },
    cardList: { gap: SPACING.md }, // Espacio entre tarjetas

    // --- Tarjeta Favorita ---
    favCard: {
        backgroundColor: palette.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        borderWidth: 1,
        borderColor: palette.border,
    },
    favCardIconWrapper: {
         width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: palette.tabIconSelected, // Celeste claro
        alignItems: "center",
        justifyContent: "center",
    },
    favCardInfo: {
        flex: 1, // Ocupa el espacio restante
        gap: SPACING.xs / 2, // Espacio pequeño entre líneas
    },
    favCardTitle: {
        fontSize: FONT.md, // Título un poco más chico
        fontWeight: '700' as const,
        color: palette.icon,
    },
    favMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6, // Espacio entre ícono y texto
    },
    favMetaText: {
        fontSize: FONT.sm,
        color: palette.muted,
    },
    favBadgeBase: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.sm,
        alignSelf: 'flex-start',
        marginTop: SPACING.xs,
    },
    favBadgeUrgent: {
        backgroundColor: '#FFE5E3',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    favBadgeTextUrgent: {
         color: '#D32F2F',
         fontSize: 10,
         fontWeight: 'bold',
    },
    favBadgePostulado: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: palette.tint,
    },
    favBadgeTextPostulado: {
         color: '#2E7D32',
         fontSize: 10,
         fontWeight: 'bold',
    },
    favHeartButton: { // Botón corazón a la derecha
        padding: SPACING.xs,
        marginLeft: 'auto', // Empuja el botón a la derecha
    },

    // --- Placeholder/Tip ---
    tipContainer: {
        marginTop: SPACING.lg, // Separación de la lista
        padding: SPACING.md,
        backgroundColor: palette.tabIconSelected, // Fondo celeste
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    tipText: {
        flex: 1, // Ocupa el espacio
        color: palette.muted,
        fontSize: FONT.sm,
    },

     // --- Texto "No hay favoritas" ---
     noJobsText: {
        textAlign: 'center',
        color: palette.muted,
        fontSize: FONT.md,
        marginTop: SPACING.lg,
        marginBottom: SPACING.lg,
    },

    // --- Estilos de Bottom Nav (Copiados) ---
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
    navItem: { alignItems: "center", gap: 4, flex: 1, paddingVertical: SPACING.xs },
    navItemActive: { position: "relative" },
    navText: { fontSize: FONT.sm, color: palette.muted },
    navTextActive: { color: palette.tint, fontWeight: "600" as const },
    activeIndicator: {
        position: "absolute",
        bottom: -SPACING.xs,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: palette.tint,
    },
});