# Reglas de Desarrollo del Proyecto Trivia App

Este archivo contiene las directrices principales y reglas que deben seguirse al desarrollar la aplicación, garantizando consistencia, un código estructurado y la adherencia al diseño establecido.

## 1. Diseño y UI (Basado en Proyecto Stitch "App trivia")

Toda la construcción visual de interfaces deberá adherirse a las siguientes directrices y tokens de diseño:

- **Modo de Color:** CLARO (`LIGHT`).
- **Tipografía:** `Plus Jakarta Sans`. Deberá ser la fuente predeterminada para todos los textos de la app.
- **Color Primario (Marca):** Morado Vibrante (`#7f0df2`). Debe usarse para acciones principales, botones CTA y elementos de enfoque.
- **Formas y Bordes:** Se utilizará un redondeo generoso (`ROUND_TWELVE` equivalente a `rounded-xl` / `rounded-2xl` en Tailwind CSS) para darle una estética amigable, moderna y tipo "juego".
- **Saturación:** Alta (`saturation: 2`). Los colores secundarios y de soporte deben ser vibrantes y llamativos para generar un ambiente lúdico.

## 2. Stack Tecnológico y Librerías

El frontend está configurado con React 19 y Vite. Se deben usar ESTRICTAMENTE las siguientes librerías que ya están instaladas para propósitos específicos:

- **Manejo de Formularios y Validación:** Usa `react-hook-form` junto a `zod` (`@hookform/resolvers/zod` en caso de requerirse interconectar). Todos los formularios (login, registro, crear quiz) deben usar este patrón.
- **Llamadas a la API REST (HTTP):** Usa `axios` configurado con instancias reutilizables (para inyectar interceptores de JWT) y enuélvelo TODO con `@tanstack/react-query` para manejar carga, errores, caché y paginación.
- **Estado Global:** Usa `zustand` para el estado persistente del usuario (sesión/token) y posiblemente el estado local del juego en curso.
- **Enrutamiento:** Usa `react-router-dom` v7 para definir páginas y protecciones de rutas ( Guards para usuarios no autenticados ).
- **Tiempo Real:** Usa `socket.io-client` para la comunicación del juego.
- **Iconos:** Usa `lucide-react`.
- **Estilos:** Usa `tailwindcss` v4.

## 3. Estructura de Proyecto (Arquitectura de Carpetas)

Mantén un orden claro basado en características o capas lógicas:

```text
src/
├── api/          # Configuración de Axios e interceptores.
├── assets/       # Imágenes, iconos, fuentes comunes.
├── components/   # Componentes compartidos y reutilizables (Botones, Inputs, Modales de UI base).
├── config/       # Constantes del proyecto (ej. WS URL, API URL).
├── features/     # Lógica agrupada por Dominio (ej. auth, game, quizzes).
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/      # Hooks de React Query (useLogin, useRegister)
│   │   └── store/      # Zustand store de sesión
│   └── game/
│       ├── socket/     # Lógica de conexión Socket.io
│       ├── views/      # Vistas específicas del juego (HostView, PlayerView)
│       └── store/      # Zustand de los puntos, podio, preguntas del juego
├── pages/        # Componentes que actúan solo como páginas de react-router (componen features).
├── routes/       # Definición de rutas y protecciones.
└── utils/        # Funciones auxiliares, parseo de errores, etc.
```

## 4. Patrones de Manejo de Errores

Para consumir REST: Extrae el mensaje de error considerando que el backend podría mandar un array por fallos de validación (`error.response?.data?.message`). Usa funciones utilitarias para esto.
Para WebSockets: Escucha siempre el evento `error` en el listener global y muestra notificaciones (toast/alertas) en la interfaz cuando sucedan.
