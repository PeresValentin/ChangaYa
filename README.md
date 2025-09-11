# ChangaYa!  

Plataforma móvil para conectar personas que requieren resolver **tareas puntuales (changas)** con trabajadores independientes dispuestos a realizarlas.  
El proyecto se desarrolla como **Trabajo Final de Ingeniería en Sistemas – UTN FRLP**.  

---

## 🚀 Objetivo  
Reducir la informalidad laboral en el mercado argentino brindando un **espacio seguro, confiable y accesible** para la contratación de servicios ocasionales.  

---

## 🛠️ Tecnologías principales  

### Frontend  
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)  
- [React Navigation](https://reactnavigation.org/)  
- Gestión de estado: Context API / Zustand / Redux (según necesidades)  

### Backend  
- [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage + Functions)  
- Node.js para funciones serverless  

### General  
- Lenguaje principal: **TypeScript** (preferido) o **JavaScript**  
- Control de versiones: **Git + GitHub**  
- Documentación: Markdown + PDFs en `/docs`  

---

## 📂 Estructura del repositorio  

```plaintext
ChangaYa/
│
├── frontend/                  # App móvil en React Native + Expo
│   ├── src/
│   ├── assets/
│   └── package.json
│
├── backend/                   # Backend en Supabase / Node.js
│   ├── src/
│   ├── tests/
│   └── package.json
│
├── docs/                      # Documentación
│   ├── design/
│   └── class_diagram/
├── .github/workflows/         # CI/CD
├── README.md
├── CONTRIBUTING.md

    Equipo

    Rafael Eguren – Legajo 31062 – rafael_eguren@alu.frlp.utn.edu.ar

    Valentín Milocco – Legajo 31067 – vmilocco@alu.frlp.utn.edu.ar

    Valentín Peres – Legajo 31066 – vperes@alu.frlp.utn.edu.ar  