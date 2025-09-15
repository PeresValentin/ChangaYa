import { View, Text, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:"center", justifyContent:"center" },
  text: { fontSize:18, fontWeight:"600" }
});
