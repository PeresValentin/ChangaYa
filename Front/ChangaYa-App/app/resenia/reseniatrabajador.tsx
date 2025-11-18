import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator, // <--- MODIFICADO
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios'; // <--- MODIFICADO
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- MODIFICADO
import theme from '../../constants/theme';
// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
const API_URL = process.env.EXPO_PUBLIC_API_URL; // <--- MODIFICADO
// =========================================================
// INTERFACES (Replicadas de [id].tsx para tipado)
// =========================================================
interface ApiUser {
    usuarioID?: string;
    usuarioId?: string | number;
    id?: string | number;
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
}
interface ApiChanga {
    changaID: string;
    titulo?: string;
    remuneracion?: number | string;
    // Esta es la definición de tu otra pantalla
    habilidades?: string | string[] | null; 
}
// =========================================================
// DATOS DE EJEMPLO (Eliminados)
// =========================================================
// const DUMMY_REVIEW_DATA = { ... }; // <--- MODIFICADO (Eliminado)
// =========================================================
// LISTA FIJA DE CRITERIOS (Se mantiene)
// =========================================================
const GENERAL_CRITERIA = [
  { id: 'actitud', name: 'Actitud' },
  { id: 'trabajoEnEquipo', name: 'Trabajo en Equipo' },
  { id: 'responsabilidad', name: 'Responsabilidad' },
  { id: 'puntualidad', name: 'Puntualidad' },
  { id: 'comunicacion', name: 'Comunicación' },
];
// =========================================================
// HELPERS (Replicados de [id].tsx)
// =========================================================
const buildDisplayName = (userLike?: ApiUser | null) => { // <--- MODIFICADO
    if (!userLike) return '';
    const first = (userLike?.nombre ?? '').trim();
    const last = (userLike?.apellido ?? '').trim();
    const fullname = [first, last].filter(Boolean).join(' ').trim();
    const username = (userLike?.nombreUsuario ?? '').trim();
    return fullname || first || username || 'Usuario';
};
const buildInitials = (name: string) => { // <--- MODIFICADO
    if (!name) return '?';
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    return initials || name.charAt(0).toUpperCase() || '?';
};
const formatCurrency = (value?: number | string | null) => { // <--- MODIFICADO
    if (value === null || value === undefined) return 'Sin definir';
    if (typeof value === 'number') {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
    }
    return String(value);
};
/**
 * Procesa las habilidades de la API (string o string[])
 * al formato que espera el RatingRow ({ id, name }[])
 */
const processSkills = (skillsData: string | string[] | null): { id: string; name: string }[] => { // <--- MODIFICADO
    if (!skillsData) return [];
    let skills: string[] = [];
    if (Array.isArray(skillsData)) {
        skills = skillsData;
    } else if (typeof skillsData === 'string') {
        skills = skillsData.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Convertir string[] a { id, name }[]
    return skills.map(skillName => ({
        // Creamos un ID único para el rating, ej: "Plomería" -> "plomeria"
        id: skillName.toLowerCase().replace(/[^a-z0-9]/g, '_'), 
        name: skillName
    }));
};
// Tipo para el estado de las calificaciones
type RatingState = {
  [key: string]: number;
};
// =========================================================
// COMPONENTES AUXILIARES (Sin cambios)
// =========================================================
interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  maxStars?: number;
  size?: number;
}
const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, maxStars = 5, size = 32 }) => {
  // ... (código sin cambios)
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starNumber = index + 1;
        return (
          <TouchableOpacity key={starNumber} onPress={() => onRate(starNumber)}>
            <Ionicons
              name={starNumber <= rating ? 'star' : 'star-outline'}
              size={size}
              color={starNumber <= rating ? '#FFC107' : palette.muted}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
interface RatingRowProps {
  id: string;
  name: string;
  rating: number;
  onRate: (id: string, newRating: number) => void;
  isSkill?: boolean;
}
const RatingRow: React.FC<RatingRowProps> = ({ id, name, rating, onRate, isSkill = false }) => {
  // ... (código sin cambios)
  return (
  <View style={[styles.ratingRow, isSkill && styles.skillRatingRow]}>
    <View style={styles.ratingInfo}>
      <Text style={styles.ratingName}>{name}</Text>
      {isSkill && <Text style={styles.skillTypeTag}>Habilidad de la changa</Text>}
    </View>
    <StarRating
      rating={rating}
      onRate={(newRating) => onRate(id, newRating)}
      size={28}
    />
  </View>
)};
// =========================================================
// COMPONENTE PRINCIPAL DE LA PANTALLA
// =========================================================
export default function DejarResenaScreen() {
  const router = useRouter();
  // <--- MODIFICADO: Recibimos ambos parámetros
  const { changaId, trabajadorId, workerName } = useLocalSearchParams<{ changaId?: string, trabajadorId?: string, workerName?: string }>();
  // --- Estados de Carga y Datos --- (NUEVOS)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerInfo, setWorkerInfo] = useState({ name: 'Cargando...', initials: '?' });
  const [changaInfo, setChangaInfo] = useState<{ titulo: string; precio: string; habilidades: { id: string; name: string }[] } | null>(null);
  // --- Estados del Formulario ---
  // <--- MODIFICADO: Se inicializa vacío, se llena con useEffect
  const [allRatings, setAllRatings] = useState<RatingState | null>(null);
  const [comment, setComment] = useState('');
  // <--- MODIFICADO: Efecto para cargar datos de API

useEffect(() => {
    if (!changaId || !trabajadorId) {
        setError("Faltan IDs de changa o trabajador.");
        setIsLoading(false);
        return;
    }

    // --- 1. SETEAMOS LA INFO DEL TRABAJADOR (YA LA TENEMOS) ---
    // Usamos el 'workerName' que viene de los params.
    const name = workerName || 'Usuario'; 
    setWorkerInfo({
        name: name,
        initials: buildInitials(name),
    });

    // --- 2. BUSCAMOS SOLO LA INFO DE LA CHANGA ---
    const fetchChangaData = async () => {
        try {
            // 'isLoading' ya está en true por defecto, 
            // no lo seteamos de nuevo para evitar parpadeos.
            
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                Alert.alert("Sesión expirada", "Volvé a iniciar sesión.");
                setIsLoading(false);
                return;
            }
            
            const headers = { Authorization: `Bearer ${token}` };

            // --- ESTA ES LA ÚNICA LLAMADA API QUE HACEMOS ---
            const changaResponse = await axios.get<{ changa: ApiChanga }>(`${API_URL}/api/changas/detalle/${changaId}`, { headers });
            const changaData = changaResponse.data.changa;
            
            setChangaInfo({
                titulo: changaData.titulo || 'Changa sin título',
                precio: formatCurrency(changaData.remuneracion),
                habilidades: processSkills(changaData.habilidades || null),
            });

        } catch (err: any) {
            console.error("Error cargando datos de la changa:", err);
            setError("No se pudieron cargar los datos de la changa.");
        } finally {
            setIsLoading(false); // Marcamos que la carga (de la changa) terminó
        }
    };

    fetchChangaData(); // <-- Llamamos a la función
    
  }, [changaId, trabajadorId, workerName]);
  // <--- MODIFICADO: Efecto para inicializar ratings DESPUÉS del fetch
  useEffect(() => {
    if (changaInfo) { // Solo se ejecuta cuando changaInfo tiene datos
        const initialRatings: RatingState = {};
        // Inicializar calificaciones para habilidades de la changa
        changaInfo.habilidades.forEach(skill => {
            initialRatings[skill.id] = 0;
        });
        // Inicializar calificaciones para criterios generale
        GENERAL_CRITERIA.forEach(criterion => {
            initialRatings[criterion.id] = 0;
        });
        setAllRatings(initialRatings);
    }
  }, [changaInfo]); // Se ispara cuando changaInfo cambia
  // --- Lógica de Calificación ---
  const handleRate = (itemId: string, newRating: number) => {
    setAllRatings(prevRatings => {
        if (!prevRatings) return null;
        return {
          ...prevRatings,
          [itemId]: newRating,
        }
    });
  };
  // --- Lógica de Envío ---
  // <--- MODIFICADO: Lógica de API real
  const handlePublish = async () => {
    // Validar que los ratings estén inicializados
    if (!allRatings) {
        Alert.alert("Error", "El formulario de calificación aún no está listo.");
        return;
    }
    const allRated = Object.values(allRatings).every(rating => rating > 0);
    if (!allRated) {
      Alert.alert("Faltan Calificaciones", "Por favor, califica todos los aspectos y habilidades antes de publicar.");
      return;
    }
    try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
            Alert.alert("Sesión expirada", "Volvé a iniciar sesión.");
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        // --- POST 1: Enviar la reseña ---
        // (Ajusta este endpoint y payload a tu backend)
        const reviewPayload = {
            changaId: changaId,
            trabajadorId: trabajadorId,
            comentario: comment,
            ratings: allRatings, // Objeto con { actitud: 5, plomeria: 4, ... }
        };
        console.log("Enviando reseña:", reviewPayload);
        // (Descomentar uando el endpoint esté listo)
        // await axios.post(`${API_URL}/api/reseñas`, reviewPayload, { headers });
        // --- POST 2: Finalizar la changa (la lógica que movimos) ---
        console.log("Finalizando changa:", changaId);
        // (Descomentar cuando el endpoint esté listo)
        // await axios.post(`${API_URL}/api/changas/finalizar/${changaId}`, {}, { headers });
        // --- Éxito ---
        Alert.alert("Reseña Publicada", "¡Gracias por tu opinión! La changa ha sido finalizada.");
        router.back(); // Volver atrás
    } catch (err: any) {
        console.error("Error publicando reseña o finalizando changa:", err?.response?.data || err);
        const backendMessage = err?.response?.data?.error || "Ocurrió un error inesperado.";
        Alert.alert("Error", backendMessage);
    }
  };
  const handleCancel = () => {
    router.back();
  };
  // --- Renderizado ---
  // <--- MODIFICADO: Estados de Carga y Error
  if (isLoading || !allRatings) { // Espera a que cargue Y a que allRatings se inicialic
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={palette.tint} />
                <Text style={styles.loadingText}>Cargando datos de la reseña...</Text>
            </View>
        </SafeAreaView>
    );
  }
  if (error) {
     return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.centered}>
                <Ionicons name="warning-outline" size={40} color={palette.tint} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={handleCancel}>
                    <Text style={styles.errorButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
  }
  // <--- MODIFICADO: Renderizadprincipal con datos reales
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Dejar Reseña al trabajador',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={{ paddingLeft: SPACING.md }}>
              <Ionicons name="arrow-back" size={24} color={palette.icon} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.workerInfoCard}>
            <View style={styles.workerAvatar}>
              <Text style={styles.workerInitials}>{workerInfo.initials}</Text>
            </View>
            <View>
              <Text style={styles.workerName}>{workerInfo.name}</Text>
              <Text style={styles.workerJobInfo}>{changaInfo?.titulo} • {changaInfo?.precio}</Text>
            </View>
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Calificar trabajador *</Text>
            <Text style={styles.sectionSubtitle}>Puntúa las habilidades y el desempeño general</Text>
            <Text style={styles.subHeader}>Habilidad(es) de la changa</Text>
            <View style={styles.ratingsList}>
              {/* <--- MODIFICADO */}
              {changaInfo?.habilidades.map(skill => (
                <RatingRow 
                  key={skill.id} 
                  id={skill.id} 
                  name={skill.name} 
                  rating={allRatings[skill.id]}
                  onRate={handleRate}
                  isSkill={true}
                />
              ))}
              {changaInfo?.habilidades.length === 0 && (
                <Text style={styles.noSkillsText}>Esta changa no tenía habilidades específicas registradas.</Text>
              )}
            </View>
            <Text style={styles.subHeader}>Aspectos generales</Text>
            <View style={styles.ratingsList}>
              {GENERAL_CRITERIA.map((criterion) => (
                <RatingRow 
                  key={criterion.id} 
                  id={criterion.id} 
                  name={criterion.name}
                  rating={allRatings[criterion.id]} 
                  onRate={handleRate}
                />
              ))}
            </View>
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Comentario</Text>
            <Text style={styles.sectionSubtitle}>Describe tu experiencia con el trabajador (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="¿Qué tal fue la actitud, comunicación, calidad del trabajo, etc.?"
              placeholderTextColor={palette.muted}
              multiline
              maxLength={500}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>
        </ScrollView>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.draftButton} onPress={handleCancel}>
            <Text style={styles.draftButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// =========================================================
// ESTILOS (Tus estilos + estilos de Carga/Error)
// =========================================================
const styles = StyleSheet.create({
  // --- Estilos de Carga y Error (NUEVOS) ---
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: palette.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: palette.text,
  },
  errorText: {
    marginTop: SPACING.md,
    fontWeight: 'bold',
    fontSize: 18,
    color: palette.tint,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: palette.tint,
  },
  noSkillsText: { // <--- MODIFICADO (Nuevo)
    fontSize: FONT.md,
    color: palette.muted,
    paddingVertical: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // --- Tus Estilos (Sin cambios) ---
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg * 6,
  },
  workerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.tabIconSelected, 
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInitials: {
    color: palette.white,
    fontSize: FONT.lg,
    fontWeight: 'bold',
  },
  workerName: {
    fontSize: FONT.md,
    fontWeight: '700' as const,
    color: palette.text,
  },
  workerJobInfo: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  sectionCard: {
    backgroundColor: palette.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: '700' as const,
    color: palette.text,
  },
  sectionSubtitle: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginTop: -SPACING.sm,
  },
  subHeader: {
    fontSize: FONT.sm,
    fontWeight: '600' as const,
    color: palette.muted,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
  },
  star: {
    marginHorizontal: SPACING.xs / 2,
  },
  ratingsList: {
    gap: SPACING.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 60, 
    justifyContent: 'space-between',
  },
  skillRatingRow: {
    backgroundColor: palette.tabIconSelected,
  },
  ratingInfo: {
    flex: 1,
    marginRight: SPACING.sm,
    justifyContent: 'center', 
  },
  ratingName: {
    fontSize: FONT.md,
    fontWeight: '600' as const,
    color: palette.text,
  },
  skillTypeTag: {
    fontSize: FONT.sm,
    color: palette.muted,
    marginTop: 2,
  },
  input: {
    backgroundColor: palette.background,
    borderRadius: RADIUS.md,
	  paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT.md,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT.sm,
    color: palette.muted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
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