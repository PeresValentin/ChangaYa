const API_URL = "http://192.168.0.194:3000/api"; // reemplazá por tu IP local o endpoint remoto

export async function registerUser(data: any) {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al registrarse");
    }

    return result;
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    throw new Error(error.message);
  }
}