import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../../constants/theme'; // Ajusta la ruta a tu theme
// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
// =========================================================
// DATOS DE EJEMPLO (Simuladoss - Info del Contratante)
// ========================================================
const DUMMY_EMPLOYER_DATA = {
  employerName: "Ana Gómez",
  jobTitle: "Plomero Urgente", // Título de la changa para contexto
  jobPrice: "$15.000",
};
// =========================================================
// NUEVA LISTA FIJA DE CRITERIOS (Para el Contratante)
// =========================================================
const CONTRATANTE_CRITERIA = [
  { id: 'claridad', name: 'Claridad en las indicaciones' },
  { id: 'respeto', name: 'Respeto y trato' },
  { id: 'pago', name: 'Paga en tiempo y forma' },
  { id: 'responsabilidad', name: 'Responsabilidad' },
  { id: 'puntualidad', name: 'Puntualidad' },
];
// Tipo para el estado de las calificaciones
type RatingState = {
  [key: string]: number; // Clave dinámica para IDs de criterios
};
// =========================================================
// COMPONENTES AUXILIARES
// =========================================================
interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  maxStars?: number;
  size?: number;
}
// Componente reutilizable para la selección de estrellas
const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, maxStars = 5, size = 32 }) => {
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
// Componente para cada fila de Calificación (Simplificado)
interface RatingRowProps {
  id: string;
  name: string;
  rating: number;
  onRate: (id: string, newRating: number) => void;
}
const RatingRow: React.FC<RatingRowProps> = ({ id, name, rating, onRate }) => (
  <View style={styles.ratingRow}>
    <View style={styles.ratingInfo}>
      <Text style={styles.ratingName}>{name}</Text>
    </View>
    <StarRating
      rating={rating}
      onRate={(newRating) => onRate(id, newRating)}
      size={28}
    />
  </View>
);
// =========================================================
// COMPONENTE PRINCIPAL DE LA PANTALLA
// =========================================================
export default function DejarResenaContratanteScreen() {
  const router = useRouter();
  const { changaId } = useLocalSearchParams<{ changaId?: string }>();
  // --- Estados del Formulario ---
  const [allRatings, setAllRatings] = useState<RatingState>(() => {
    const initialRatings: RatingState = {};
    // Inicializar calificaciones solo para los criterios del contratante
    CONTRATANTE_CRITERIA.forEach(criterion => {
      initialRatings[criterion.id] = 0;
    });
    return initialRatings;
  });
  const [comment, setComment] = useState('');
  // --- Lógica de Calificación ---
  const handleRate = (itemId: string, newRating: number) => {
    setAllRatings(prevRatings => ({
      ...prevRatings,
      [itemId]: newRating,
    }));
  };
  // --- Lógica de Envío ---
  const handlePublish = async () => {
    // Validación simple
    const allRated = Object.values(allRatings).every(rating => rating > 0);
    if (!allRated) {
      Alert.alert("Faltan Calificaciones", "Por favor, califica todos los aspectos antes de publicar.");
      return;
    }
    console.log("Publicando reseña del CONTRATANTE para Changa ID:", changaId);
    console.log("Calificaciones:", allRatings);
    console.log("Comentario:", comment);
    // Lógica de API (POST a /api/reseñas-contratante) ...
    // El body incluiría:
    // {
    //   changa_id: changaId,
    //   comentario: comment,
    //   ...allRatings (calificacion_claridad, calificacion_respeto, etc.)
    // }
    Alert.alert("Reseña Publicada", "¡Gracias por tu opinión!");
    router.back(); // Volver atrás
  };
  const handleCancel = () => {
    router.back();
  };
  // --- Renderizado ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Reseñar Contratante',
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
          <View style={styles.employerInfoCard}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitials}>AG</Text>
            </View>
            <View>
              <Text style={styles.employerName}>{DUMMY_EMPLOYER_DATA.employerName}</Text>
              <Text style={styles.employerJobInfo}>{DUMMY_EMPLOYER_DATA.jobTitle} • {DUMMY_EMPLOYER_DATA.jobPrice}</Text>
            </View>
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Calificar contratante *</Text>
            <Text style={styles.sectionSubtitle}>Puntúa tu experiencia con {DUMMY_EMPLOYER_DATA.employerName}</Text>
            <View style={styles.ratingsList}>
              {CONTRATANTE_CRITERIA.map((criterion) => (
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
            <Text style={styles.sectionSubtitle}>Describe tu experiencia (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="¿Fue claro/a con las indicaciones? ¿Hubo algún problema con el pago?"
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
// ESTILOS
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
    padding: SPACING.md,
    paddingBottom: SPACING.lg * 6,
  },
  // --- Tarjeta Info Contratante (Color Azul) ---
  employerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF', // Un azul claro
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  employerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF', // Azul primario
    alignItems: 'center',
    justifyContent: 'center',
  },
  employerInitials: {
    color: palette.white,
    fontSize: FONT.lg,
    fontWeight: 'bold',
  },
  employerName: {
    fontSize: FONT.md,
    fontWeight: '700' as const,
    color: palette.text,
  },
  employerJobInfo: {
    fontSize: FONT.sm,
    color: palette.muted,
  },
  // --- Tarjeta de Sección ---
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
  // --- Estrellas ---
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
  },
  star: {
    marginHorizontal: SPACING.xs / 2,
  },
  // --- Habilidades/Criterios (Ratings List) ---
  ratingsList: {
    gap: SPACING.md,
  },
  // Estilo general para cualquier fila de calificación
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
// --- ESTILOS ELIMINADOS: skillRatingRow, skillTypeTag ---
  ratingInfo: {
    flex: 1, // Permite que el texto ocupe el espacio disponible
    marginRight: SPACING.sm,
    justifyContent: 'center', 
  },
  ratingName: {
    fontSize: FONT.md,
    fontWeight: '600' as const,
    color: palette.text,
    flexWrap: 'wrap', // Asegura que el texto largo se ajuste
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