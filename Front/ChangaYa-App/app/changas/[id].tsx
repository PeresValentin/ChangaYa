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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useProfileNavigation } from '@/hooks/use-profile-navigation';
import theme from '../../constants/theme';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;

interface PersonSummary {
    id: string;
    initials: string;
    name: string;
    rating: number;
    reviews: number;
    memberSince: string;
}

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
    contractor: PersonSummary;
    assignedWorker?: PersonSummary;
    applicants: PersonSummary[];
    location: {
        address: string;
        walkingTime: string;
    };
}

const DUMMY_JOB_DETAILS: JobDetails = {
    id: 'plomero-urgente',
    title: 'Plomero Urgente',
    urgent: true,
    price: '$15.000',
    distance: 'A 0.5 km de tu ubicación',
    schedule: 'Necesario hoy',
    icon: 'build-outline',
    description: 'Se rompió la canilla del baño...',
    requirements: ['Experiencia en plomería', 'Disponibilidad inmediata', 'Herramientas propias'],
    contractor: { id: 'c1', initials: 'CP', name: 'Carlos Pérez', rating: 4.7, reviews: 24, memberSince: 'enero 2022' },
    assignedWorker: { id: 'w1', initials: 'MR', name: 'María Rodríguez', rating: 4.8, reviews: 32, memberSince: 'marzo 2023' },
    applicants: [
        { id: 'w1', initials: 'MR', name: 'María Rodríguez', rating: 4.8, reviews: 32, memberSince: 'marzo 2023' },
        { id: 'w2', initials: 'JG', name: 'Jorge Gómez', rating: 4.5, reviews: 18, memberSince: 'junio 2021' },
        { id: 'w3', initials: 'AL', name: 'Ana López', rating: 4.9, reviews: 40, memberSince: 'febrero 2020' }
    ],
    location: { address: 'Calle 50 y 15, La Plata', walkingTime: '6 minutos caminando' },
};

const JobDetailsScreen = () => {
    const { id, viewMode } = useLocalSearchParams<{ id?: string, viewMode?: string }>();
    const { goToProfile } = useProfileNavigation();
    const router = useRouter();

    const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setJobDetails(DUMMY_JOB_DETAILS);
            setIsLoading(false);
        }, 300);
    }, [id]);

    if (isLoading) return <SafeAreaView style={styles.safeArea}><Text>Cargando...</Text></SafeAreaView>;
    if (!jobDetails) return <SafeAreaView style={styles.safeArea}><Text>No se encontraron detalles.</Text></SafeAreaView>;

    const isContractor = viewMode === 'contratante';
    const profile = isContractor && jobDetails.assignedWorker ? jobDetails.assignedWorker : jobDetails.contractor;
    const profileLabel = isContractor && jobDetails.assignedWorker ? 'Trabajador asignado' : 'Contratante';
    const hasApplicants = isContractor && jobDetails.applicants.length > 0;

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

        <Text style={styles.applicantSince}>⭐ {w.rating} ({w.reviews})</Text>
       
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

                {/* Descripción */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.bodyText}>{jobDetails.description}</Text>
                </View>

                {/* Requisitos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requisitos</Text>
                    {jobDetails.requirements.map((req, i) => (
                        <View key={i} style={styles.requirementRow}>
                            <Ionicons name="checkmark-circle-outline" size={18} color={palette.tint} />
                            <Text style={styles.bodyText}>{req}</Text>
                        </View>
                    ))}
                </View>

                {/* Contratante o Trabajador */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{profileLabel}</Text>

                    <View style={styles.contractorCard}>
                        <View style={styles.contractorAvatar}>
                            <Text style={styles.contractorInitials}>{profile.initials}</Text>
                        </View>

                        <View style={styles.contractorInfo}>
                            <Text style={styles.contractorName}>{profile.name}</Text>
                            <Text style={styles.ratingText}>⭐ {profile.rating} ({profile.reviews})</Text>
                            <Text style={styles.memberSinceText}>Miembro desde {profile.memberSince}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => goToProfile(profile.id)}
                        >
                            <Text style={styles.profileButtonText}>Ver perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Postulantes */}
                {hasApplicants && (
                    <View style={styles.section}>
                        <View style={styles.applicantsHeader}>
                            <Text style={styles.sectionTitle}>Trabajadores postulados</Text>
                            <Text style={styles.applicantsCounter}>{jobDetails.applicants.length}</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {jobDetails.applicants.map(renderApplicantCard)}
                        </ScrollView>
                    </View>
                )}


                {/* Ubicación */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>

                    <View style={styles.locationCard}>
                        <Ionicons name="location-sharp" size={20} color={palette.tint} style={{ marginRight: SPACING.sm }} />
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
                <View style={styles.footer}>
                {isContractor ? (
                    <View style={{ flexDirection: "row", gap: SPACING.md, flex: 1 }}>
                        <TouchableOpacity 
                            style={[styles.actionButtonPrimary, { flex: 1 }]}
                            onPress={() => 
                                router.push({ 
                                    pathname: "/changas/editar/[id]",
                                    params: { id: jobDetails.id }
                                })
                            }
                        >
                            <Ionicons name="create-outline" size={20} color={palette.white} />
                            <Text style={styles.actionButtonTextPrimary}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButtonSecondary, { flex: 1 }]}
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
