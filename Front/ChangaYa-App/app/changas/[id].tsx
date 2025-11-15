import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Stack, useLocalSearchParams } from 'expo-router';

import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';

import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import theme from '../../constants/theme';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;


interface ApiUser {
    usuarioID?: string;
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
    email?: string;
    telefono?: string;
    rankingGeneral?: number | null;
    created_at?: string;
}

interface ApiPostulacion {
    postulacionID?: string;
    usuarioID?: string;
    usuario?: ApiUser;
}

interface ApiChanga {
    changaID: string;
    titulo?: string;
    descripcion?: string;
    remuneracion?: number | string;
    horaInicio?: string;
    horaFin?: string;
    estado?: string;
    direccion?: string;
    ubicacion?: string;
    trabajadorID?: string | null;
    contratanteID?: string | null;
    // TODO: agregar requisitos/localización detallada cuando el backend lo provea
    requisitos?: string | string[] | null;
}

interface JobDetailsResponse {
    changa: ApiChanga;
    contratante?: ApiUser;
    postulaciones?: ApiPostulacion[];
}

interface PersonSummary {
    id: string;
    initials: string;
    name: string;
    rating?: number | null;
    reviews?: number | null;
    memberSince?: string;
    email?: string;
    phone?: string;
}
const sanitizeName = (value?: string | null) => (value ?? '').trim();

const buildDisplayName = (userLike?: ApiUser | null) => {
    if (!userLike) return '';
    const composed = [sanitizeName(userLike?.nombre), sanitizeName(userLike?.apellido)]
        .filter(Boolean)
        .join(' ')
        .trim();
    const candidates = [sanitizeName(userLike?.nombreUsuario), composed, sanitizeName(userLike?.nombre)]
        .filter(Boolean);
    return candidates[0] || '';
};

const buildInitials = (name: string) => {
    if (!name) return '?';
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    return initials || name.charAt(0).toUpperCase() || '?';
};

const toPersonSummary = (userLike?: ApiUser | null): PersonSummary | null => {
    if (!userLike) return null;
    const name = buildDisplayName(userLike) || 'Usuario';
    return {
        id: String(userLike.usuarioID || ''),
        initials: buildInitials(name),
        name,
        rating: typeof userLike.rankingGeneral === 'number' ? userLike.rankingGeneral : null,
        reviews: null,
        memberSince: userLike.created_at
            ? new Date(userLike.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
            : undefined,
        email: userLike.email || undefined,
        phone: userLike.telefono || undefined,

    };

};

const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined) return 'Sin definir';
    if (typeof value === 'number') {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
    }
    return String(value);
};

const extractRequirements = (changa: ApiChanga) => {
    if (!changa.requisitos) return [];
    if (Array.isArray(changa.requisitos)) return changa.requisitos;
    // TODO: reemplazar este split cuando el backend envíe un array normalizado
    return changa.requisitos.split(',').map((req) => req.trim()).filter(Boolean);


};

const formatSchedule = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'Horario a coordinar';
    return `${startTime} - ${endTime}`;
};

const JobDetailsScreen = () => {
    const { id, viewMode } = useLocalSearchParams<{ id?: string, viewMode?: string }>();
    const { goToProfile } = useProfileNavigation();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    
    const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchJobDetails = useCallback(async () => {
        if (!id) {
            setErrorMessage('No se encontró el identificador de la changa.');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage(null);
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) {
                setErrorMessage('Tu sesión expiró. Iniciá sesión nuevamente.');
                setIsLoading(false);
                return;
            }

            const response = await axios.get<JobDetailsResponse>(`${API_URL}/api/changas/detalle/${id}`,
                { headers: { Authorization: `Bearer ${token}` } });
            setJobDetails(response.data);
        } catch (error: any) {
            console.error('Error al cargar la changa', error?.response?.data || error);
            const backendMessage = error?.response?.data?.error || 'Ocurrió un error al obtener la changa.';
            setErrorMessage(backendMessage);
            Alert.alert('Error', backendMessage);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, id]);

    useEffect(() => {
        fetchJobDetails();
    }, [fetchJobDetails]);
    const isContractor = viewMode === 'contratante';
     const applicants = useMemo<PersonSummary[]>(() => {
        if (!jobDetails?.postulaciones) return [];
        return jobDetails.postulaciones
            .map((post) => toPersonSummary(post.usuario))
            .filter((candidate): candidate is PersonSummary => Boolean(candidate?.id));
    }, [jobDetails?.postulaciones]);

    const assignedWorker = useMemo(() => {
        if (!isContractor || !jobDetails?.changa?.trabajadorID) return null;
        return applicants.find((applicant) => applicant.id === String(jobDetails.changa.trabajadorID)) || null;
    }, [applicants, isContractor, jobDetails?.changa?.trabajadorID]);

    const contractorSummary = useMemo(() => toPersonSummary(jobDetails?.contratante), [jobDetails?.contratante]);

    const profile = isContractor ? assignedWorker : contractorSummary;
    const profileLabel = isContractor ? 'Trabajador asignado' : 'Contratante';
    const hasApplicants = isContractor && applicants.length > 0;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator style={{ marginTop: SPACING.lg }} color={palette.tint} size="large" />
            </SafeAreaView>
        );
    }

    if (errorMessage) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ padding: SPACING.lg }}>
                    <Text style={styles.sectionTitle}>Ups...</Text>
                    <Text style={styles.bodyText}>{errorMessage}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!jobDetails) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ padding: SPACING.lg }}>
                    <Text style={styles.sectionTitle}>No encontramos la changa.</Text>
                    <Text style={styles.bodyText}>Intentá volver atrás e ingresar nuevamente.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const { changa } = jobDetails;
    const requirements = extractRequirements(changa);
    const summaryIcon: keyof typeof Ionicons.glyphMap = 'construct-outline';
    const scheduleText = formatSchedule(changa.horaInicio, changa.horaFin);
    const locationText = changa.direccion || changa.ubicacion || 'Ubicación a coordinar';
    const locationDetail = changa.estado ? `Estado: ${changa.estado}` : 'Disponibilidad sujeta a confirmación';

    const renderApplicantCard = (w: PersonSummary) => (
    <TouchableOpacity
            key={w.id}
            style={styles.applicantCard}
            activeOpacity={0.85}
            onPress={() => goToProfile(w.id)}
        >
            <View style={styles.applicantAvatar}>
                <Text style={styles.applicantInitials}>{w.initials}</Text>
            </View>

            <Text style={styles.applicantName} numberOfLines={1}>{w.name}</Text>

            {typeof w.rating === 'number' && (
                <Text style={styles.applicantSince}>⭐ {w.rating.toFixed(1)}</Text>
            )}

        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    title: 'Detalles de la Changa',
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                }}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                {/* Resumen */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconWrapper}>
                        <Ionicons name={summaryIcon} size={30} color={palette.tint} />
                    </View>

                    <View style={styles.summaryInfo}>
                        <View style={styles.summaryTitleRow}>
                            <Text style={styles.summaryTitle}>{changa.titulo || 'Changa sin título'}</Text>
                             {changa.estado?.toLowerCase() === 'urgente' && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentText}>URGENTE</Text>
                                </View>
                            )}
                        </View>

                       <Text style={styles.summaryPrice}>{formatCurrency(changa.remuneracion)}</Text>

                        <View style={styles.summaryMetaRow}>
                            <Ionicons name="location-outline" size={14} color={palette.muted} />
                             <Text style={styles.summaryMetaText}>{locationText}</Text>
                        </View>

                        <View style={styles.summaryMetaRow}>
                            <Ionicons name="calendar-outline" size={14} color={palette.muted} />
                           <Text style={styles.summaryMetaText}>{scheduleText}</Text>
                        </View>
                    </View>
                </View>

                {/* Descripción */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                   <Text style={styles.bodyText}>{changa.descripcion || 'El contratante no agregó descripción.'}</Text>
                </View>

                {/* Requisitos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requisitos</Text>
                 {requirements.length === 0 ? (
                        <Text style={styles.bodyText}>
                            Aún no se cargaron requisitos específicos para esta changa.
                        </Text>
                    ) : (
                        requirements.map((req, i) => (
                            <View key={i} style={styles.requirementRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color={palette.tint} />
                                <Text style={styles.bodyText}>{req}</Text>
                            </View>
                        ))
                    )}
                </View>

               {/* Contratante o Trabajador */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{profileLabel}</Text>
                    {profile ? (
                        <View style={styles.contractorCard}>
                            <View style={styles.contractorAvatar}>
                                <Text style={styles.contractorInitials}>{profile.initials}</Text>
                            </View>

                            <View style={styles.contractorInfo}>
                                <Text style={styles.contractorName}>{profile.name}</Text>
                                {typeof profile.rating === 'number' && (
                                    <Text style={styles.ratingText}>⭐ {profile.rating.toFixed(1)}</Text>
                                )}
                                <Text style={styles.memberSinceText}>
                                    {profile.phone ? `Tel: ${profile.phone}` : profile.email || 'Sin datos de contacto'}
                                </Text>
                                {profile.memberSince && (
                                    <Text style={styles.memberSinceText}>Miembro desde {profile.memberSince}</Text>
                                )}
                            </View>

                            {profile.id ? (
                                <TouchableOpacity
                                    style={styles.profileButton}
                                    onPress={() => goToProfile(profile.id)}
                                >
                                    <Text style={styles.profileButtonText}>Ver perfil</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : (
                        <Text style={styles.bodyText}>
                            {isContractor
                                ? 'Todavía no hay un trabajador asignado.'
                                : 'No pudimos recuperar al contratante. Intenta nuevamente más tarde.'}
                        </Text>
                    )}
                </View>
                {/* Postulantes */}
                {hasApplicants && (
                    <View style={styles.section}>
                        <View style={styles.applicantsHeader}>
                            <Text style={styles.sectionTitle}>Trabajadores postulados</Text>
                             <Text style={styles.applicantsCounter}>{applicants.length}</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                     {applicants.map(renderApplicantCard)}
                        </ScrollView>
                    </View>
                )}


                {/* Ubicación */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>

                    <View style={styles.locationCard}>
                        <Ionicons name="location-sharp" size={20} color={palette.tint} style={{ marginRight: SPACING.sm }} />
                        <View>
                            <Text style={styles.addressText}>{locationText}</Text>

                            <View style={styles.walkingRow}>
                                <Ionicons name="walk-outline" size={16} color={palette.muted} />
                               <Text style={styles.walkingText}>{locationDetail}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

                <View style={styles.footer}>
                    {isContractor ? (
                        <View style={{ flexDirection: "row", gap: SPACING.md, flex: 1 }}>
                            <TouchableOpacity style={[styles.actionButtonPrimary, { flex: 1 }]}>
                                <Ionicons name="create-outline" size={20} color={palette.white} />
                                <Text style={styles.actionButtonTextPrimary}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButtonSecondary, { flex: 1 }]}
                                // Acá después conectás el cierre real con backend
                                onPress={() => console.log("Cerrar changa")}
                            >
                                <Ionicons name="close-circle-outline" size={20} color={palette.tint} />
                                <Text style={styles.actionButtonTextSecondary}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.actionButtonPrimary}>
                            <Ionicons name="hand-right-outline" size={20} color={palette.white} />
                            <Text style={styles.actionButtonTextPrimary}>Postularme</Text>
                        </TouchableOpacity>
                    )}
                </View>


            {!isContractor && (
                <Text style={styles.tipText}>
                    💡 Tip: Las respuestas rápidas aumentan tus posibilidades.
                </Text>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.background },

    scroll: { flex: 1 },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.lg * 6 },

    summaryCard: {
        flexDirection: 'row',
        backgroundColor: palette.tabIconSelected,
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

    summaryInfo: { flex: 1 },

    summaryTitleRow: { flexDirection: 'row', alignItems: 'center' },

    summaryTitle: {
        fontSize: FONT.lg,
        fontWeight: '700',
        color: palette.icon,
        marginRight: SPACING.xs,
    },

    urgentBadge: {
        backgroundColor: '#F44336',
        borderRadius: RADIUS.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },

    urgentText: { color: palette.white, fontSize: 10, fontWeight: 'bold' },

    summaryPrice: {
        fontSize: FONT.md,
        fontWeight: '600',
        color: palette.icon,
        marginBottom: SPACING.xs,
    },

    summaryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summaryMetaText: { fontSize: FONT.sm, color: palette.muted },

    section: { marginBottom: SPACING.lg },
    sectionTitle: { fontSize: FONT.lg, fontWeight: '700', color: palette.icon, marginBottom: SPACING.sm },
    bodyText: { fontSize: FONT.md, color: palette.text, lineHeight: FONT.md * 1.4 },

    requirementRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },

    applicantsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },

    applicantsCounter: {
        backgroundColor: palette.tabIconSelected,
        color: palette.tint,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.md,
        fontWeight: '600',
    },

    applicantCard: {
        width: 150,
        backgroundColor: palette.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: palette.border,
        marginRight: SPACING.sm,
        alignItems: 'center',
    },

    applicantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: palette.tabIconSelected,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },

    applicantInitials: {
        fontSize: FONT.md,
        fontWeight: '700',
        color: palette.tint,
    },

    applicantName: {
        fontSize: FONT.md,
        fontWeight: '600',
        color: palette.icon,
        marginBottom: 2,
    },

    applicantSince: {
        fontSize: FONT.sm,
        color: palette.muted,
        marginBottom: 4,
    },

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
        backgroundColor: palette.tabIconSelected,
        alignItems: 'center',
        justifyContent: 'center',
    },

    contractorInitials: { fontSize: FONT.lg, fontWeight: 'bold', color: palette.tint },

    contractorInfo: { flex: 1 },

    contractorName: { fontSize: FONT.md, fontWeight: '700', color: palette.icon },

    ratingText: { fontSize: FONT.sm, color: palette.muted },

    memberSinceText: { fontSize: FONT.sm, color: palette.muted },

    profileButton: {
        backgroundColor: palette.background,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: palette.border,
    },

    profileButtonText: { fontSize: FONT.sm, fontWeight: '600', color: palette.tint },

    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: palette.border,
    },

    addressText: { fontSize: FONT.md, fontWeight: '700', color: palette.icon },

    walkingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    walkingText: { fontSize: FONT.sm, color: palette.muted },

    footer: {
        position: 'absolute',
        bottom: SPACING.lg + 30,
        left: SPACING.lg,
        right: SPACING.lg,
        justifyContent: 'center',
    },

    actionButtonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.tint,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },

    actionButtonTextPrimary: { color: palette.white, fontSize: FONT.md, fontWeight: 'bold' },

    tipText: {
        position: 'absolute',
        bottom: SPACING.md,
        left: SPACING.lg,
        right: SPACING.lg,
        textAlign: 'center',
        color: palette.muted,
    },
    actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: palette.tint,
},

actionButtonTextSecondary: {
    color: palette.tint,
    fontSize: FONT.md,
    fontWeight: "bold",
},
});

export default JobDetailsScreen;
