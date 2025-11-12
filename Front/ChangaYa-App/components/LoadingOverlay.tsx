import React from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useLoading } from '../hooks/LoadingContext'; // Ajustá la ruta
import theme from '../constants/theme'; // Importa tu tema

const palette = theme.Colors.light;

const LoadingOverlay: React.FC = () => {
  // Obtenemos el estado 'isLoading' desde nuestro contexto
  const { isLoading } = useLoading();

  // Si no está cargando, no renderiza nada
  if (!isLoading) {
    return null;
  }

  // Si está cargando, muestra un Modal sobre toda la pantalla
  return (
    <Modal
      transparent={true} // Fondo transparente
      animationType="fade" // Animación sutil
      visible={isLoading}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Este es el "icono de carga que gira" */}
          <ActivityIndicator size="large" color={palette.white} />
          <Text style={styles.text}>Cargando...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo oscuro semi-transparente
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Un recuadro más oscuro
    borderRadius: theme.RADIUS.md,
    padding: theme.SPACING.lg,
    alignItems: 'center',
    gap: theme.SPACING.md,
  },
  text: {
    color: palette.white,
    fontSize: theme.FONT.md,
  }
});

export default LoadingOverlay;