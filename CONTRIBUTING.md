# Guía de Contribución – ChangaYa!

## Flujo de ramas
- `main`: rama estable. Solo se actualiza con *pull requests* aprobados.  
- `develop`: rama de integración principal.  
- `feature/*`: ramas para nuevas funcionalidades. Ejemplo: `feature/chat`.  
- `hotfix/*`: ramas para arreglos urgentes.  

## Convención de commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):  
- `feat:` nueva funcionalidad  
- `fix:` corrección de bug  
- `docs:` cambios en documentación  
- `style:` formato sin lógica (espacios, comas, etc.)  
- `refactor:` cambios internos sin alterar comportamiento  
- `test:` agregar o corregir tests  
- `chore:` mantenimiento (configs, dependencias, etc.)  

## Organización del código
### Frontend
- `src/components`: componentes reutilizables  
- `src/screens`: pantallas principales  
- `src/navigation`: navegación  
- `src/services`: consumo de API  
- `src/store`: gestión de estado  

### Backend
- `src/controllers`: lógica de negocio  
- `src/models`: modelos de datos  
- `src/routes`: endpoints  
- `src/services`: servicios externos  

## Buenas prácticas
- Mantener **bajo acoplamiento y alta cohesión**.  
- Aplicar principios **SOLID** y **GRASP** cuando sea posible.  
- No subir credenciales ni claves al repositorio.  
- Revisar *pull requests* de compañeros antes de aprobar.  

## Testing
- Frontend: `npm run test` (Jest + React Native Testing Library).  
- Backend: `npm run test` (Jest o Vitest).  
Cada *feature* nuevo debe traer tests básicos.  

## Confidencialidad
El proyecto está cubierto por el **Acuerdo de Confidencialidad (NDA)**.  
No se debe compartir código ni documentación fuera del equipo sin autorización.
