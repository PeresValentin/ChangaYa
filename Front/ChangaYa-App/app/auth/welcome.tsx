import { View, Text, StyleSheet } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Bienvenida</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:"center", justifyContent:"center" },
  text: { fontSize:18, fontWeight:"600" }
});
