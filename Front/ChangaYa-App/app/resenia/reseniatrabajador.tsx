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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import theme from '../../constants/theme'; // Ajusta la ruta a tu theme
// Constantes del tema
const { FONT, SPACING, RADIUS } = theme;
const palette = theme.Colors.light;
// =========================================================
// DATOS DE EJEMPLO (Simuladoss)
// =========================================================
const DUMMY_REVIEW_DATA = {
  workerName: "Juan Pérez",
  jobTitle: "Plomero Urgente",
  jobPrice: "$15.000",
  skills: [
    { id: 'plomeria', name: 'Plomería' },
    { id: 'electricidad', name: 'Electricidad' },
    { id: 'carpinteria', name: 'Carpintería' }, // Añadimos una más para probar
  ],
};
// =========================================================
// LISTA FIJA DE CRITERIOS A CALIFICAR (además de las habilidades de la changa)
// =========================================================
const GENERAL_CRITERIA = [
  { id: 'actitud', name: 'Actitud' },
  { id: 'trabajoEnEquipo', name: 'Trabajo en Equipo' },
  { id: 'responsabilidad', name: 'Responsabilidad' },
  { id: 'puntualidad', name: 'Puntualidad' },
  { id: 'comunicacion', name: 'Comunicación' },
];
// Tipo para el estado de las calificaciones
type RatingState = {
  [key: string]: number; // Clave dinámica para IDs de habilidades y criterios
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
// Componente reutilizable para la selección de estrellas (SIN CAMBIOS en la funcionalidad)
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
// Componente para cada fila de Calificación (unificado para habilidades y criterios)
interface RatingRowProps {
  id: string;
  name: string;
  rating: number;
  onRate: (id: string, newRating: number) => void;
  isSkill?: boolean; // Para diferenciar visualmente si es necesario
}
const RatingRow: React.FC<RatingRowProps> = ({ id, name, rating, onRate, isSkill = false }) => (
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
);
// =========================================================
// COMPONENTE PRINCIPAL DE LA PANTALLA
// =========================================================
export default function DejarResenaScreen() {
  const router = useRouter();
  const { changaId } = useLocalSearchParams<{ changaId?: string }>();
  // --- Estados del Formulario ---
  // Combinamos habilidades de la changa y criterios generales en un solo objeto de estado
  const [allRatings, setAllRatings] = useState<RatingState>(() => {
    const initialRatings: RatingState = {};
    // Inicializar calificaciones para habilidades de la changa
    DUMMY_REVIEW_DATA.skills.forEach(skill => {
      initialRatings[skill.id] = 0;
    });
    // Inicializar calificaciones para criterios generales
    GENERAL_CRITERIA.forEach(criterion => {
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
    // TODO: Agregar validaciones (ej. que todos los ratings > 0, comentario no vacío)
    // Por ahora, una validación simple:
    const allRated = Object.values(allRatings).every(rating => rating > 0);
    if (!allRated) {
      Alert.alert("Faltan Calificaciones", "Por favor, califica todos los aspectos y habilidades antes de publicar.");
      return;
    }
    console.log("Publicando reseña para Changa ID:", changaId);
    console.log("Todas las Calificaciones:", allRatings);
    console.log("Comentario:", comment);
    // Lógica de API (POST a /api/reseñas) ...
    // El body incluiría:
    // {
    //   changa_id: changaId,
    //   comentario: comment,
    //   ...allRatings (todos los IDs y sus valores)
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
              <Text style={styles.workerInitials}>JP</Text>
            </View>
            <View>
              <Text style={styles.workerName}>{DUMMY_REVIEW_DATA.workerName}</Text>
              <Text style={styles.workerJobInfo}>{DUMMY_REVIEW_DATA.jobTitle} • {DUMMY_REVIEW_DATA.jobPrice}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Calificar trabajador *</Text>
            <Text style={styles.sectionSubtitle}>Puntúa las habilidades y el desempeño general</Text>
            <Text style={styles.subHeader}>Habilidad(es) de la changa</Text>
            <View style={styles.ratingsList}>
              {DUMMY_REVIEW_DATA.skills.map(skill => (
                <RatingRow 
                  key={skill.id} 
                  id={skill.id} 
                  name={skill.name} 
                  rating={allRatings[skill.id]} 
                  onRate={handleRate}
                  isSkill={true}
                />
              ))}
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
// ESTILOS (Ajustadospara el layout)
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
    marginTop: SPACING.md, // Más espacio para separar secciones
    marginBottom: SPACING.sm, // Espacio antes de la lista
  },
  // --- Estrellas ---
  starContainer: {
    flexDirection: 'row',
    // Justificar al final para que las estrellas se peguen a la derecha
    justifyContent: 'flex-end', 
    // Eliminar padding horizontal aquí, se maneja en la fila
    // marginVertical: SPACING.xs, // Quitado, se maneja en la fila
  },
  star: {
    marginHorizontal: SPACING.xs / 2, // Estrellas más juntas
  },
  // --- Habilidades/Criterios (Ratings List) ---
  ratingsList: {
    gap: SPACING.md,
  },
  // Estilo general para cualquier fila de calificación
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center', // Centrar verticalmente contenido
    backgroundColor: palette.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 60, 
    justifyContent: 'space-between', // Espaciar texto y estrellas
  },
  // Estilo específico para habilidades de changa (opcional, para visual)
  skillRatingRow: {
    backgroundColor: palette.tabIconSelected, // Fondo más claro para habilidades
  },
  ratingInfo: {
    flex: 1, // Permite que el texto ocupe el espacio disponible
    marginRight: SPACING.sm, // Espacio entre texto y estrellas
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