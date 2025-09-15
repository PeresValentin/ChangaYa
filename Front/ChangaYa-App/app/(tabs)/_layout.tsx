import { Redirect } from "expo-router";

export default function Index() {
  // Siempre que arranque la app, redirige a la pantalla de bienvenida
  return <Redirect href="/auth/welcome" />;
}