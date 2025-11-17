import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

import {
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
import { SafeAreaView } from 'react-native-safe-area-context';

const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;


interface ApiUser {
    usuarioID?: string;
    usuarioId?: string | number;
    id?: string | number;
    _id?: string | number;
    userId?: string | number;
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
    trabajadores?: string[];
    contratanteID?: string | null;
    // TODO: agregar habilidades/localización detallada cuando el backend lo provea
    habilidades?: string | string[] | null;
}

interface JobDetailsResponse {
    changa: ApiChanga;
    contratante?: ApiUser;
    postulaciones?: ApiPostulacion[];
}

interface NominatimReverseResponse {
    display_name?: string;
    address?: {
        road?: string;
        house_number?: string;
        neighbourhood?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
         hamlet?: string;
        quarter?: string;
    };
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
    
    const first = sanitizeName(userLike?.nombre);
    const last = sanitizeName(userLike?.apellido);
    const fullname = [first, last].filter(Boolean).join(' ').trim();
    const username = sanitizeName(userLike?.nombreUsuario);

    // PRIORIDAD:
    // 1. nombre + apellido
    if (fullname) return fullname;

    // 2. solo nombre
    if (first) return first;

    // 3. username
    if (username) return username;

    return '';
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
    const candidateId =
        userLike.usuarioID ||
        userLike.usuarioId ||
        userLike.id ||
        userLike._id ||
        userLike.userId;

    if (!candidateId) return null;

    const name = buildDisplayName(userLike) || 'Usuario';
    return {
        id: String(candidateId),
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

const extractHabilities = (changa: ApiChanga) => {
    if (!changa.habilidades) return [];
    if (Array.isArray(changa.habilidades)) return changa.habilidades;
    // TODO: reemplazar este split cuando el backend envíe un array normalizado
    return changa.habilidades.split(',').map((req) => req.trim()).filter(Boolean);


};

const parseDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (date: Date, includeTime = false) => {
    const datePart = new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
        .format(date)
        .replace(/,\s*/g, ' ');

    if (!includeTime) {
        return datePart;
    }

    const timePart = new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);

    return `${datePart} · ${timePart} hs`;
};


const formatSchedule = (startTime?: string, endTime?: string) => {
   const startDate = parseDate(startTime);
    const endDate = parseDate(endTime);

    if (startDate && endDate) {
        const sameDay = startDate.toDateString() === endDate.toDateString();
        if (startDate) {
        return formatDateLabel(startDate, true);
        }

        return `${formatDateLabel(startDate, true)} - ${formatDateLabel(endDate, true)}`;
    }

    
    if (endDate) {
        return formatDateLabel(endDate, true);
    }

    return 'Horario a coordinar';
};

type Coordinates = { latitude: number; longitude: number };

const parsePointFromWKT = (value: string): Coordinates | null => {
    const match = value.match(/POINT\s*\(\s*([-.\d]+)\s+([-.\d]+)\s*\)/i);
    if (!match) return null;
    const longitude = parseFloat(match[1]);
    const latitude = parseFloat(match[2]);
    return Number.isFinite(longitude) && Number.isFinite(latitude)
        ? { latitude, longitude }
        : null;
};

const parsePointFromEWKB = (value: string): Coordinates | null => {
    const hex = value.replace(/[^0-9a-fA-F]/g, '');
    if (!hex || hex.length % 2 !== 0) return null;

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }

    if (bytes.length < 21) return null;

    const dataView = new DataView(bytes.buffer);
    const littleEndian = dataView.getUint8(0) === 1;
    let offset = 1;
    let type = dataView.getUint32(offset, littleEndian);
    offset += 4;

    const hasSRID = (type & 0x20000000) !== 0;
    type = type & 0x000000FF;
    if (type !== 1) return null;

    if (hasSRID) {
        if (bytes.length < offset + 4) return null;
        offset += 4; // omitimos SRID
    }

    if (bytes.length < offset + 16) return null;

    const longitude = dataView.getFloat64(offset, littleEndian);
    const latitude = dataView.getFloat64(offset + 8, littleEndian);

    return Number.isFinite(longitude) && Number.isFinite(latitude)
        ? { latitude, longitude }
        : null;
};

const parsePointCoordinates = (value?: string | null): Coordinates | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const plainMatch = trimmed.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
    if (plainMatch) {
        const latitude = parseFloat(plainMatch[1]);
        const longitude = parseFloat(plainMatch[2]);
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            return { latitude, longitude };
        }
    }
    return parsePointFromWKT(trimmed) || parsePointFromEWKB(trimmed);
};

const formatLocation = (
    changa: ApiChanga,
    reverseAddress?: string | null,
    coordinates?: Coordinates | null,
) => {
    const trimmedAddress = changa.direccion?.trim();
    if (trimmedAddress) {
        return trimmedAddress;
    }

    if (reverseAddress?.trim()) {
        return reverseAddress.trim();
    }

   
    if (coordinates) {
        return `Lat ${coordinates.latitude.toFixed(4)}, Lon ${coordinates.longitude.toFixed(4)}`;
    }

    return 'Ubicación a coordinar';
};

const JobDetailsScreen = () => {
    const { id, viewMode } = useLocalSearchParams<{ id?: string, viewMode?: string }>();
    const { goToProfile } = useProfileNavigation();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const router = useRouter();

    // Rol real del usuario autenticado (trabajador / contratante)
    const [userRole, setUserRole] = useState<"trabajador" | "contratante" | null>(null);

    // Computa el rol REAL del usuario actual
    const isContractor = useMemo(() => {

        // 1. Si viewMode vino de navegación, lo respetamos
        if (viewMode === "contratante") return true;
        if (viewMode === "trabajador") return false;

        // 2. Sino, usamos el rol real del usuario
        if (userRole === "contratante") return true;
        if (userRole === "trabajador") return false;

        // Fallback seguro para evitar crashes
        return false;
    }, [viewMode, userRole]);   

    const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<string | null>(null);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isCheckingApplication, setIsCheckingApplication] = useState(false);

    const coordinates = useMemo(() => parsePointCoordinates(jobDetails?.changa?.ubicacion), [jobDetails?.changa?.ubicacion]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userData');
                if (!storedUser) return;

                const parsedUser = JSON.parse(storedUser);
                const extractedID =
                    parsedUser?.id ||
                    parsedUser?._id ||
                    parsedUser?.usuarioID ||
                    parsedUser?.userId;

                if (extractedID) {
                    setCurrentUserId(String(extractedID));
                }
            } catch (storageError) {
                console.error('Error al recuperar el usuario desde AsyncStorage', storageError);
            }
        };

        loadUserData();
    }, []);

    useEffect(() => {
        const loadUserRole = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("userData");
                if (!storedUser) return;

                const parsed = JSON.parse(storedUser);
                const normalized = (parsed?.rol || parsed?.tipoUsuario || "").toLowerCase().trim();

                // Normalizamos el rol
                if (normalized.includes("trab")) {
                    setUserRole("trabajador");
                } else {
                    setUserRole("contratante");
                }
            } catch (e) {
                console.error("Error cargando rol del usuario", e);
            }
        };

        loadUserRole();
    }, []);


    const checkExistingApplication = useCallback(async () => {
        if (isContractor || !id || !currentUserId) return;

        try {
            setIsCheckingApplication(true);
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) {
                return;
            }

            const response = await axios.get(`${API_URL}/api/postulaciones/mis`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = Array.isArray(response.data) ? response.data : [];
            const alreadyApplied = data.some((post: any) => String(post.changaID) === String(id));
            setHasApplied(alreadyApplied);
        } catch (applicationError: any) {
            console.error('Error al verificar postulaciones', applicationError?.response?.data || applicationError);
        } finally {
            setIsCheckingApplication(false);
        }
    }, [API_URL, currentUserId, id, isContractor]);

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
            const cacheBust = `_t=${new Date().getTime()}`;
            
            const response = await axios.get<JobDetailsResponse>(
                `${API_URL}/api/changas/detalle/${id}`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        // Estas cabeceras le dicen a Axios y al servidor
                        // que NO usen una respuesta en caché.
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    } 
                }
            );
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

     const handleApply = useCallback(async () => {
        if (isContractor || !jobDetails?.changa?.changaID || hasApplied) {
            return;
        }

        try {
            setIsApplying(true);
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) {
                Alert.alert('Sesión expirada', 'Iniciá sesión nuevamente para postularte.');
                return;
            }

            await axios.post(
                `${API_URL}/api/postulaciones`,
                {
                    changaID: jobDetails.changa.changaID,
                    usuarioID: currentUserId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setHasApplied(true);
            Alert.alert('Postulación enviada', 'Tu postulación fue enviada correctamente.');
            await checkExistingApplication();
        } catch (applyError: any) {
            console.error('Error al postularse', applyError?.response?.data || applyError);
            const backendMessage = applyError?.response?.data?.error
                || 'No pudimos enviar tu postulación. Intentá nuevamente.';
            Alert.alert('Error', backendMessage);

            const normalizedMessage = typeof backendMessage === 'string' ? backendMessage.toLowerCase() : '';
            if (normalizedMessage.includes('ya te postulaste')) {
                setHasApplied(true);
            }
        } finally {
            setIsApplying(false);
        }
    }, [API_URL, checkExistingApplication, currentUserId, hasApplied, isContractor, jobDetails?.changa?.changaID]);

    const handleCloseApplications = useCallback(async () => {
        if (!isContractor) return;
        if (!jobDetails?.changa?.changaID) return;

        Alert.alert(
            "Cerrar postulaciones",
            "¿Confirmás que querés cerrar las postulaciones? Esta acción enviará todas las postulaciones a aceptadas o rechazadas según corresponda.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("jwtToken");
                            if (!token) {
                                Alert.alert("Sesión expirada", "Volvé a iniciar sesión.");
                                return;
                            }

                            await axios.post(
                                `${API_URL}/api/changas/cerrar/${jobDetails.changa.changaID}`,
                                {},
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            Alert.alert(
                                "Postulaciones cerradas",
                                "La changa pasó a estado 'en proceso'."
                            );

                            await fetchJobDetails();

                        } catch (err: any) {
                            console.error("Error cerrando postulaciones:", err?.response?.data || err);

                            const backendMessage =
                                err?.response?.data?.error || "Ocurrió un error inesperado.";

                            Alert.alert("Error", backendMessage);
                        }
                    },
                },
            ]
        );
    }, [API_URL, isContractor, jobDetails?.changa?.changaID, fetchJobDetails]);


useFocusEffect(
  useCallback(() => {
    // Esta función que le pasamos a useFocusEffect es síncrona
    // y es lo que React espera.
    
    // Adentro, llamamos a nuestra función async
    fetchJobDetails();

    // Opcional: podés retornar una función de limpieza
    return () => {
      // console.log("Saliendo de foco de [id]");
    };
  }, [fetchJobDetails]) // La dependencia es la propia función 'fetchJobDetails'
);
    useEffect(() => {
        if (!isContractor) {
            checkExistingApplication();
        }
    }, [isContractor, checkExistingApplication]);

    useEffect(() => {
        if (!jobDetails?.changa) {
            setReverseGeocodedAddress(null);
            return;
        }

        const trimmedAddress = jobDetails.changa.direccion?.trim();
        if (trimmedAddress || !coordinates) {
            setReverseGeocodedAddress(null);
            return;
        }

        let isCancelled = false;

        const fetchAddress = async () => {
            setReverseGeocodedAddress(null);

            try {
                const response = await axios.get<NominatimReverseResponse>('https://nominatim.openstreetmap.org/reverse', {
                    params: {
                        format: 'jsonv2',
                        lat: coordinates.latitude,
                        lon: coordinates.longitude,
                        zoom: 18,
                        addressdetails: 1,
                    },
                    headers: {
                        'Accept-Language': 'es-AR',
                        'User-Agent': 'ChangaYaApp/1.0 (https://changaya.app/soporte)',
                    },
                    timeout: 8000,
                });

                if (isCancelled) return;

                const data = response.data;
                const address = data?.address || {};
                const streetLine = [address.road, address.house_number]
                    .filter(Boolean)
                    .join(' ')
                    .trim();
                const areaLine = address.suburb || address.neighbourhood || address.quarter || '';
                const cityLine = address.city || address.town || address.village || address.hamlet || '';
                const candidate = [streetLine || null, areaLine || null, cityLine || null]
                    .filter(Boolean)
                    .join(', ')
                    .trim()
                    || streetLine
                    || data?.display_name
                    || null;

                setReverseGeocodedAddress(candidate || null);
            } catch (geocodeError: any) {
                if (!isCancelled) {
                    console.error('Error al convertir coordenadas en dirección', geocodeError?.response?.data || geocodeError);
                    setReverseGeocodedAddress(null);
                }
            }
        };

        fetchAddress();

        return () => {
            isCancelled = true;
        };
    }, [jobDetails?.changa?.direccion, coordinates?.latitude, coordinates?.longitude]);

    const applicants = useMemo<PersonSummary[]>(() => {
        if (!jobDetails?.postulaciones) return [];
        return jobDetails.postulaciones
            .map((post) => toPersonSummary(post.usuario))
             .filter((candidate): candidate is PersonSummary => Boolean(candidate));
    }, [jobDetails?.postulaciones]);

    const assignedWorkers = useMemo(() => {
        if (!isContractor) return [];

        const assignedIDs = (jobDetails?.changa?.trabajadores || []).map((workerId) => String(workerId));
        if (assignedIDs.length === 0) return [];

        return applicants.filter((a) => assignedIDs.includes(a.id));
    }, [applicants, isContractor, jobDetails?.changa?.trabajadores]);

    const contractorSummary = useMemo(() => toPersonSummary(jobDetails?.contratante), [jobDetails?.contratante]);

    const profile = isContractor ? assignedWorkers : contractorSummary;
    const profileLabel =
        isContractor && !assignedWorkers
            ? null                   //  OCULTAR si contratado y SIN asignado
            : isContractor
                ? 'Trabajador asignado'
                : 'Contratante';

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
    const habilities = extractHabilities(changa);
    const summaryIcon: keyof typeof Ionicons.glyphMap = 'construct-outline';
    const scheduleText = formatSchedule(changa.horaInicio, changa.horaFin);
    const locationText = formatLocation(changa, reverseGeocodedAddress, coordinates);
    const locationDetail = changa.estado ? `Estado: ${changa.estado}` : 'Disponibilidad sujeta a confirmación';

    const renderApplicantCard = (w: PersonSummary) => (
    <TouchableOpacity
            key={w.id}
            style={styles.applicantCard}
            activeOpacity={0.85}
            onPress={() => goToProfile(w.id, { changaId: jobDetails?.changa?.changaID })}
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

                {/* Habilidades */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Habilidades requeridas</Text>
                 {habilities.length === 0 ? (
                        <Text style={styles.bodyText}>
                            No existen habilidades requeridas para esta changa.
                        </Text>
                    ) : (
                        habilities.map((req, i) => (
                            <View key={i} style={styles.requirementRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color={palette.tint} />
                                <Text style={styles.bodyText}>{req}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* ────────────────────────────────────────────────
                    SECCIÓN: CONTRATANTE / TRABAJADOR ASIGNADO
                ──────────────────────────────────────────────── */}

                {/** CONTRATANTE viendo la changa **/}
                {isContractor ? (
                    <>
                        {assignedWorkers.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    {assignedWorkers.length === 1
                                        ? "Trabajador asignado"
                                        : "Trabajadores asignados"}
                                </Text>

                                {assignedWorkers.map((worker) => (
                                    <View key={worker.id} style={styles.contractorCard}>
                                        <View style={styles.contractorAvatar}>
                                            <Text style={styles.contractorInitials}>{worker.initials}</Text>
                                        </View>

                                        <View style={styles.contractorInfo}>
                                            <Text style={styles.contractorName}>{worker.name}</Text>

                                            {typeof worker.rating === "number" && (
                                                <Text style={styles.ratingText}>⭐ {worker.rating.toFixed(1)}</Text>
                                            )}

                                            {worker.phone && (
                                                <Text style={styles.memberSinceText}>Tel: {worker.phone}</Text>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={styles.profileButton}
                                           onPress={() => goToProfile(worker.id, { changaId: jobDetails?.changa?.changaID })}
                                        >
                                            <Text style={styles.profileButtonText}>Ver perfil</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    /** TRABAJADOR viendo al CONTRATANTE **/
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contratante</Text>

                        {contractorSummary ? (
                            <View style={styles.contractorCard}>
                                <View style={styles.contractorAvatar}>
                                    <Text style={styles.contractorInitials}>{contractorSummary.initials}</Text>
                                </View>

                                <View style={styles.contractorInfo}>
                                    <Text style={styles.contractorName}>{contractorSummary.name}</Text>

                                    {typeof contractorSummary.rating === "number" && (
                                        <Text style={styles.ratingText}>
                                            ⭐ {contractorSummary.rating.toFixed(1)}
                                        </Text>
                                    )}

                                    {contractorSummary.phone ? (
                                        <Text style={styles.memberSinceText}>Tel: {contractorSummary.phone}</Text>
                                    ) : (
                                        <Text style={styles.memberSinceText}>{contractorSummary.email}</Text>
                                    )}

                                    {contractorSummary.memberSince && (
                                        <Text style={styles.memberSinceText}>
                                            Miembro desde {contractorSummary.memberSince}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.profileButton}
                                    onPress={() => goToProfile(contractorSummary.id)}
                                >
                                    <Text style={styles.profileButtonText}>Ver perfil</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.bodyText}>
                                No pudimos recuperar los datos del contratante.
                            </Text>
                        )}
                    </View>
                )}
                {/* Postulantes */}
                {hasApplicants && (
                    <View style={styles.section}>
                        <View style={styles.applicantsHeader}>
                            <Text style={styles.sectionTitle}>Postulantes</Text>
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
                        <TouchableOpacity 
                            style={[styles.actionButtonPrimary, { flex: 1 }]}
                            onPress={() => 
                                router.push({ 
                                    pathname: "/changas/editar/[id]",
                                    params: { id: jobDetails.changa.changaID }
                                })
                            }
                        >
                            <Ionicons name="create-outline" size={20} color={palette.white} />
                            <Text style={styles.actionButtonTextPrimary}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButtonSecondary, { flex: 1 }]}
                            onPress={handleCloseApplications}
                        >
                            <Ionicons name="close-circle-outline" size={20} color={palette.tint} />
                            <Text style={styles.actionButtonTextSecondary}>Cerrar postulaciones</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                     <TouchableOpacity
                        style={[
                            styles.actionButtonPrimary,
                            (hasApplied || isApplying || isCheckingApplication) && styles.actionButtonPrimaryDisabled,
                        ]}
                        disabled={hasApplied || isApplying || isCheckingApplication}
                        onPress={handleApply}
                    >
                        {isApplying ? (
                            <ActivityIndicator size="small" color={palette.white} />
                        ) : (
                            <Ionicons
                                name={hasApplied ? 'checkmark-circle-outline' : 'hand-right-outline'}
                                size={20}
                                color={palette.white}
                            />
                        )}
                        <Text style={styles.actionButtonTextPrimary}>
                            {hasApplied ? 'Ya postulado' : 'Postularme'}
                        </Text>
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
    actionButtonPrimaryDisabled: {
        opacity: 0.7,
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
