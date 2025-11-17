import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../constants/theme';
import { useProfileNavigation } from '../../hooks/use-profile-navigation';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ------------------ Types --------------------
type JobStatus = 'abierta' | 'en_progreso' | 'finalizada';
type JobSubStatus = 'pendiente_seleccion' | 'pocos_candidatos' | 'en_curso' | 'completada';
type PostulacionStatus = 'aceptada' | 'rechazada' | 'iniciada';

interface Changa {
    id: string;
    title: string;
    description?: string;
    price: string;
    published?: string;
    dueDate?: string;
    status: JobStatus;
    subStatus: JobSubStatus;
    postulantes?: number;
    postulacionEstado?: PostulacionStatus;
    trabajador?: {
        name: string;
        rating?: number;
    };
    icon: keyof typeof Ionicons.glyphMap;
}

// ------------------ Mapper Backend → Front --------------------
const mapChangaToFront = (c: any): Changa => {
    const statusMap: Record<string, JobStatus> = {
        iniciada: "abierta",
        enProceso: "en_progreso",
        finalizada: "finalizada"
    };

    const subStatusMap: Record<string, JobSubStatus> = {
        iniciada: "pendiente_seleccion",
        enProceso: "en_curso",
        finalizada: "completada"
    };

    //  Aquí obtenemos estado de postulación (solo aplica a trabajador)
    const postulacionEstado: PostulacionStatus | undefined =
        c.postulacion?.[0]?.estado ?? undefined;

    return {
        id: c.changaID,
        title: c.titulo,
        description: c.descripcion,
        price: `$${c.remuneracion}`,
        status: statusMap[c.estado],
        subStatus: subStatusMap[c.estado],
        postulantes: Array.isArray(c.trabajadores) ? c.trabajadores.length : 0,

        //  Ahora sí pasa la info correctamente al front
        postulacionEstado,

        icon: "briefcase-outline",
    };
};

// ------------------ Card --------------------
const ChangaCard: React.FC<{ changa: Changa }> = ({ changa }) => {
    const router = useRouter();

    const getStatusStyle = (subStatus: JobSubStatus) => {
        switch (subStatus) {
            case 'pendiente_seleccion': return styles.badgeOpen;
            case 'pocos_candidatos': return styles.badgeOpenWarning;
            case 'completada': return styles.badgeCompleted;
            default: return styles.badgeOpen;
        }
    };
    const getStatusTextStyle = (subStatus: JobSubStatus) => {
        switch (subStatus) {
            case 'pendiente_seleccion': return styles.badgeTextOpen;
            case 'pocos_candidatos': return styles.badgeTextOpen;
            case 'en_curso': return styles.badgeTextProgress;
            case 'completada': return styles.badgeTextCompleted;
            default: return styles.badgeTextOpen;
        }
    };

    const getStatusText = (changa: Changa): string => {
        if (changa.postulantes && changa.status === 'abierta') return `${changa.postulantes} postulantes`;
        if (changa.subStatus === 'en_curso') return 'EN CURSO';
        if (changa.subStatus === 'completada') return 'Completada';
        return '';
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: "/changas/[id]", params: { id: changa.id } })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                    <Ionicons name={changa.icon} size={22} color={palette.tint} />
                </View>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{changa.title}</Text>
                    {changa.description && <Text style={styles.cardDescription}>{changa.description}</Text>}
                </View>
                <View style={[styles.badgeBase, getStatusStyle(changa.subStatus)]}>
                    <Text style={[styles.badgeTextBase, getStatusTextStyle(changa.subStatus)]}>
                        {getStatusText(changa)}
                    </Text>
                </View>
            </View>
            {changa.postulacionEstado && changa.subStatus === "en_curso" && (
                <View style={styles.postulacionEstadoWrapper}>
                    <Text
                        style={[
                            styles.postulacionEstadoText,
                            changa.postulacionEstado === "aceptada"
                                ? styles.postulacionAceptada
                                : changa.postulacionEstado === "rechazada"
                                ? styles.postulacionRechazada
                                : styles.postulacionPendiente
                        ]}
                    >
                        {changa.postulacionEstado === 'aceptada'
                            ? '✔ Aceptada'
                            : changa.postulacionEstado === 'rechazada'
                            ? '✖ Rechazada'
                            : 'Postulación enviada'}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// ------------------ Main Screen --------------------
export default function MisChangasScreen() {
    const router = useRouter();
    const pathname = usePathname();

    const { goToProfile } = useProfileNavigation();
  const [activeFilter, setActiveFilter] = useState<JobStatus>('abierta');

    const [changasAbiertas, setChangasAbiertas] = useState<Changa[]>([]);
    const [changasEnProgreso, setChangasEnProgreso] = useState<Changa[]>([]);
    const [changasFinalizadas, setChangasFinalizadas] = useState<Changa[]>([]);
    const [loading, setLoading] = useState(true);

    // ---- Fetch Data from Backend ----
    const loadChangas = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("jwtToken");
            const headers = { Authorization: `Bearer ${token}` };

            // Abiertas
            const abiertasRes = await axios.get(`${API_URL}/api/changas/abiertas`, { headers });
            setChangasAbiertas(abiertasRes.data.map(mapChangaToFront));

            // En Proceso
            const enProcesoRes = await axios.get(`${API_URL}/api/changas/enProceso`, { headers });
            setChangasEnProgreso(enProcesoRes.data.map(mapChangaToFront));

            // Finalizadas
            const finalizadasRes = await axios.get(`${API_URL}/api/changas/finalizadas`, { headers });
            setChangasFinalizadas(finalizadasRes.data.map(mapChangaToFront));

        } catch (err) {
            console.error("❌ Error cargando changas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChangas();
    }, []);

    const filteredChangas = useMemo(() => {
        if (activeFilter === 'abierta') return changasAbiertas;
        if (activeFilter === 'en_progreso') return changasEnProgreso;
        if (activeFilter === 'finalizada') return changasFinalizadas;
        return [];
    }, [activeFilter, changasAbiertas, changasEnProgreso, changasFinalizadas]);

    const countPendientes = changasAbiertas.length;
    const countEnProgreso = changasEnProgreso.length;
    const countFinalizadas = changasFinalizadas.length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    title: 'Mis Changas',
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity
                            style={{ marginRight: SPACING.md }}
                            onPress={() => router.push('/changas/nueva')}
                        >
                            <Ionicons name="add-circle-outline" size={28} color={palette.tint} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.container}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                    {/* ---- Filtros ---- */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'abierta' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('abierta')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'abierta' && styles.filterTextActive]}>
                                Abiertas
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'en_progreso' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('en_progreso')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'en_progreso' && styles.filterTextActive]}>
                                En Progreso
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterButton, activeFilter === 'finalizada' && styles.filterButtonActive]}
                            onPress={() => setActiveFilter('finalizada')}
                        >
                            <Text style={[styles.filterText, activeFilter === 'finalizada' && styles.filterTextActive]}>
                                Finalizadas
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ---- Listas ---- */}

                    {activeFilter === 'abierta' && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Pendientes de selección ({countPendientes})
                            </Text>
                            <View style={styles.cardList}>
                                {changasAbiertas.map(changa => (
                                    <ChangaCard key={changa.id} changa={changa} />
                                ))}
                            </View>
                        </View>
                    )}

                    {activeFilter === 'en_progreso' && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                En progreso ({countEnProgreso})
                            </Text>
                            <View style={styles.cardList}>
                                {changasEnProgreso.map(changa => (
                                    <ChangaCard key={changa.id} changa={changa} />
                                ))}
                            </View>
                        </View>
                    )}

                    {activeFilter === 'finalizada' && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Finalizadas ({countFinalizadas})
                            </Text>
                            <View style={styles.cardList}>
                                {changasFinalizadas.map(changa => (
                                    <ChangaCard key={changa.id} changa={changa} />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ---- Sin resultados ---- */}
                    {filteredChangas.length === 0 && (
                        <Text style={styles.noJobsText}>
                            No tienes changas en estado {activeFilter.replace('_', ' ')}.
                        </Text>
                    )}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.lg * 6 },

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
      backgroundColor: palette.tint,
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
  
  sectionContainer: {
      marginBottom: SPACING.lg,
  },
   sectionTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon,
    marginBottom: SPACING.sm,
  },
  cardList: { gap: SPACING.md },
  
   card: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.tabIconSelected,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { 
    fontSize: FONT.lg, 
    fontWeight: "700" as const, 
    color: palette.icon 
  },
  cardDescription: { 
    marginTop: 2, 
    fontSize: FONT.md, 
    color: palette.muted 
  },
  badgeBase: {
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeTextBase: {
    fontSize: FONT.sm,
    fontWeight: "600" as const,
  },
  badgeOpen: {
    backgroundColor: palette.tint, 
  },
  badgeTextOpen: {
    color: palette.white,
  },
  badgeOpenWarning: {
    backgroundColor: '#FFC107',
  },
  badgeProgress: {
    backgroundColor: "#FFA000", 
  },
  badgeTextProgress: {
    color: palette.white,
  },
  badgeCompleted: {
    backgroundColor: palette.background,
  },
  badgeTextCompleted: {
    color: palette.muted, 
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
  },
  metaText: { 
    fontSize: FONT.sm, 
    color: palette.muted,
  },
  metaTextBold: {
    fontSize: FONT.sm,
    color: palette.icon,
    fontWeight: '600' as const,
  },
  metaStateText: {
     fontSize: FONT.sm,
     color: palette.icon,
     fontStyle: 'italic',
  },
   metaStateTextWarning: {
     fontSize: FONT.sm,
     color: '#FFA000',
     fontWeight: '500' as const,
  },
  
  viewAllButton: {
      marginTop: SPACING.md,
      backgroundColor: palette.background,
      padding: SPACING.sm,
      borderRadius: RADIUS.md,
      alignItems: 'center',
  },
   viewAllButtonText: {
       color: palette.tint,
       fontWeight: '600' as const,
       fontSize: FONT.md,
  },
  
   noJobsText: {
       textAlign: 'center',
       color: palette.muted,
       fontSize: FONT.md,
       marginTop: SPACING.lg,
       marginBottom: SPACING.lg,
  },

  summaryFooterCard: {
      marginTop: SPACING.lg,
      backgroundColor: palette.icon,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
  },
  summaryFooterText: {
      color: palette.white,
      fontSize: FONT.sm,
      flex: 1,
  },
   summaryFooterRating: {
       color: palette.white,
       fontSize: FONT.sm,
       fontWeight: 'bold',
   },
  
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
  postulacionEstadoWrapper: {
    marginTop: 4,
    alignSelf: "flex-end",     // ESTO LO PONE A LA DERECHA
    },

    postulacionEstadoText: {
        fontSize: FONT.sm,
        fontWeight: "600",
    },

    postulacionAceptada: {
        color: "#2e7d32", // verde
    },

    postulacionRechazada: {
        color: "#c62828", // rojo
    },

    postulacionPendiente: {
        color: palette.muted,
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
  }
});