# Documentación del Proyecto TuEvento - Frontend Web

## Resumen Ejecutivo

Este documento describe el desarrollo completo de la aplicación web TuEvento, un sistema de gestión de eventos que incluye funcionalidades para usuarios finales, organizadores y administradores.

## Arquitectura del Proyecto

### Visión General de la Arquitectura

TuEvento es una **aplicación web de página única (SPA)** construida con una arquitectura de componentes React moderna. El sistema sigue el patrón de **arquitectura por capas** con separación clara de responsabilidades:

```
┌─────────────────┐
│   PRESENTACIÓN  │ ← Componentes React, UI/UX
├─────────────────┤
│   LÓGICA DE NEGOCIO │ ← Hooks, Context, State Management
├─────────────────┤
│   DATOS Y API   │ ← Servicios, Context API, Local Storage
├─────────────────┤
│   INFRAESTRUCTURA │ ← React Router, Vite, Build Tools
└─────────────────┘
```

### Tecnologías Utilizadas

#### **Core Framework**
- **React 19.1.1**: Framework principal con Concurrent Features, Server Components, y nuevas APIs de hooks
- **React DOM 19.1.1**: Renderizado y manipulación del DOM

#### **Enrutamiento y Navegación**
- **React Router DOM 7.8.1**: Sistema de rutas cliente-side con:
  - `BrowserRouter` para navegación basada en URL
  - `Routes` y `Route` para definición de rutas
  - `Link` y `useNavigate` para navegación programática
  - `useLocation` y `useParams` para acceso a estado de ruta

#### **Estilos y UI**
- **Tailwind CSS 4.1.12**: Framework CSS utility-first con:
  - Sistema de diseño consistente
  - Responsive design con breakpoints
  - Dark mode y temas personalizados
  - Animaciones y transiciones

#### **Estado y Gestión de Datos**
- **React Hooks**: `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`
- **Context API**: Para estado global del canvas y aplicación
- **Custom Hooks**: `useDragAndDrop`, `useHistory` para lógica reutilizable

#### **Animaciones y UX**
- **Framer Motion 12.23.16**: Biblioteca de animaciones con:
  - `motion.div` para componentes animados
  - `AnimatePresence` para animaciones de entrada/salida
  - Gestos y transiciones personalizadas

#### **Utilidades y Herramientas**
- **Lucide React**: Iconos SVG consistentes y escalables
- **Nanoid**: Generación de IDs únicos para elementos
- **Immer**: Inmutabilidad para actualizaciones de estado complejas
- **InteractJS**: Interacciones drag & drop avanzadas

#### **Herramientas de Desarrollo**
- **Vite**: Build tool ultra-rápido con:
  - Hot Module Replacement (HMR)
  - Tree Shaking automático
  - Optimización de bundles
  - Servidor de desarrollo con recarga instantánea

- **ESLint**: Linting con reglas específicas para React
- **PostCSS**: Procesamiento de CSS con Autoprefixer

### Arquitectura de Componentes

#### **Patrón de Arquitectura: Componentes por Funcionalidad**

```
src/
├── components/
│   ├── layout/           # Componentes de layout y estructura
│   │   ├── MainLayout.jsx    # Layout principal con navegación
│   │   ├── Nav.jsx           # Barra de navegación superior
│   │   └── TopNavbar.jsx     # Navbar del diseñador de planos
│   │
│   ├── views/            # Páginas/Vistas principales
│   │   ├── ladingPage.jsx    # Página de inicio
│   │   ├── Events.jsx        # Listado de eventos
│   │   ├── EventsInfo.jsx    # Detalles de evento
│   │   ├── FloorPlanDesigner.jsx  # Diseñador de planos
│   │   ├── AdminLogin.jsx     # Login de admin
│   │   ├── AdminDashboard.jsx # Dashboard de admin
│   │   └── Forms/             # Formularios especializados
│   │       └── EventRequestForm.jsx
│   │
│   ├── CanvasElement.jsx     # Componentes del canvas
│   └── DrawingCanvas.jsx     # Canvas principal interactivo
│
├── context/             # Estado global
│   └── MapContext.jsx       # Contexto del diseñador de mapas
│
└── App.jsx              # Punto de entrada de rutas
```

#### **Jerarquía de Componentes**

```
App (Router)
├── MainLayout (Layout compartido)
│   ├── Nav (Navegación)
│   └── [Page Content]
│       ├── LandingPage
│       ├── Events
│       │   └── EventCard (×3)
│       └── EventsInfo
│           ├── EventDetails
│           ├── CommentsSection
│           └── MapModal
│               └── DrawingCanvas
│                   └── CanvasElement (×n)
│
├── FloorPlanDesigner (Layout propio)
│   ├── TopNavbar
│   ├── ToolPanel
│   ├── DrawingCanvas
│   │   └── CanvasElement (×n)
│   └── PropertiesPanel
│
├── AdminLogin (Layout minimalista)
└── AdminDashboard (Layout minimalista)
```

### Arquitectura de Estado

#### **Patrón de Gestión de Estado: Context + Hooks**

```jsx
// 1. Context API para estado global
const MapContext = createContext();

// 2. Provider con reducer pattern
<MapProvider>
  <FloorPlanDesigner />
</MapProvider>

// 3. Custom hooks para acceso
const useMapState = () => useContext(MapContext);
const useMapDispatch = () => {
  const { dispatch } = useContext(MapContext);
  return dispatch;
};

// 4. Uso en componentes
const FloorPlanDesignerInner = () => {
  const { elements, selectedId } = useMapState();
  const dispatch = useMapDispatch();

  // Lógica del componente
};
```

#### **Flujo de Datos Unidireccional**

```
User Action → Event Handler → State Update → Re-render → UI Update

Ejemplo en Events.jsx:
Click "Filtrar" → handleFilter() → setFilteredEvents() → Re-render Grid
```

### Arquitectura de Comunicación

#### **Sistema de Eventos y Props**

```jsx
// Comunicación padre-hijo (props down)
<Events onEventSelect={handleEventSelect} />

// Comunicación hijo-padre (callbacks)
<EventCard
  event={event}
  onSelect={() => onEventSelect(event.id)}
/>

// Comunicación entre hermanos (lifting state up)
Events.jsx (padre)
├── EventCard (hijo) → onSelect callback
├── Filters (hijo) → onFilter callback
└── SearchBar (hijo) → onSearch callback
```

#### **Context API para Estado Compartido**

```jsx
// Comunicación global sin prop drilling
const CanvasContext = React.createContext();

const DrawingCanvas = () => {
  const { elements, selectedId } = useContext(CanvasContext);
  // Acceso directo al estado global
};
```

### Arquitectura de Rutas

#### **Configuración de React Router**

```jsx
<BrowserRouter>
  <Routes>
    {/* Rutas públicas con layout */}
    <Route path="/" element={
      <MainLayout>
        <LandingPage />
      </MainLayout>
    } />

    {/* Rutas públicas sin layout */}
    <Route path="/FloorPlanDesigner" element={<FloorPlanDesigner />} />

    {/* Rutas protegidas/admin */}
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
  </Routes>
</BrowserRouter>
```

#### **Lazy Loading y Code Splitting**

```jsx
// Implementación futura para optimización
const Events = lazy(() => import('./views/Events.jsx'));
const EventsInfo = lazy(() => import('./views/EventsInfo.jsx'));

<Route path="/events" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Events />
  </Suspense>
} />
```

### Arquitectura de Estilos

#### **Sistema de Diseño con Tailwind CSS**

```jsx
// 1. Utility-first approach
<button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">

// 2. Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 3. Dark mode support
<div className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">

// 4. Custom animations
<div className="animate-pulse transition-all duration-300 ease-in-out">
```

#### **Tema y Variables CSS**

```css
/* En tailwind.config.js */
theme: {
  extend: {
    colors: {
      primary: '#8b5cf6',    // Purple-600
      secondary: '#6b7280',  // Gray-500
      accent: '#10b981',     // Emerald-500
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    }
  }
}
```

### Arquitectura de Performance

#### **Optimizaciones Implementadas**

1. **React.memo** para componentes puros
2. **useCallback** para funciones estables
3. **useMemo** para cálculos costosos
4. **Lazy loading** de rutas (preparado)
5. **Tree shaking** automático con Vite

#### **Virtualización para Grandes Listas**

```jsx
// Para futuro cuando haya muchos eventos
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={events.length}
  itemSize={100}
>
  {({ index, style }) => (
    <EventCard style={style} event={events[index]} />
  )}
</List>
```

### Arquitectura de Seguridad

#### **Protección de Rutas**

```jsx
// Componente de ruta protegida (futuro)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Uso
<Route path="/admin-dashboard" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### Arquitectura de Testing

#### **Estrategia de Testing**

```javascript
// Configuración ESLint para calidad de código
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Arquitectura de Despliegue

#### **Configuración de Build**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    }
  }
})
```

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                REACT APPLICATION                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │  ROUTING   │   STATE     │   STYLES    │               │
│  │             │ MANAGEMENT │              │               │
│  │ React Router│ Context API│ Tailwind CSS│               │
│  │ useNavigate │ useState   │ Utility-    │               │
│  │ Link        │ useContext │ First       │               │
│  └─────────────┴─────────────┴─────────────┘               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │ COMPONENTS │   HOOKS     │   CONTEXT   │               │
│  │             │             │             │               │
│  │ Layout      │ Custom      │ Global      │               │
│  │ Views       │ Business    │ State       │               │
│  │ Forms       │ Logic       │             │               │
│  └─────────────┴─────────────┴─────────────┘               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │  UTILITIES │   ASSETS    │   CONFIG    │               │
│  │             │             │             │               │
│  │ Helpers     │ Images      │ ESLint      │               │
│  │ Constants   │ Icons       │ Vite        │               │
│  │ Types       │ Fonts       │             │               │
│  └─────────────┴─────────────┴─────────────┘               │
└─────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                BUILD SYSTEM                                │
├─────────────────────────────────────────────────────────────┤
│  Vite + Rollup + ESBuild + PostCSS + Autoprefixer         │
└─────────────────────────────────────────────────────────────┘
```

### Conclusión de Arquitectura

Esta arquitectura proporciona:

- **Escalabilidad**: Componentes modulares y reutilizables
- **Mantenibilidad**: Separación clara de responsabilidades
- **Performance**: Optimizaciones implementadas y preparadas
- **Developer Experience**: Herramientas modernas y configuración optimizada
- **User Experience**: Interfaz responsiva y animaciones fluidas
- **Testability**: Código estructurado para testing efectivo

La arquitectura sigue las mejores prácticas de React moderno y está preparada para crecimiento futuro con nuevas funcionalidades y equipos de desarrollo más grandes.

## Funcionalidades Implementadas

### 1. Sistema de Autenticación Administrativa

#### AdminLogin.jsx
- **Propósito**: Autenticación de administradores del sistema
- **Características**:
  - Formulario de login con email y contraseña
  - Validación básica de campos
  - Navegación a dashboard tras login exitoso
  - Diseño responsivo con Tailwind CSS

#### AdminDashboard.jsx
- **Propósito**: Panel de control para administradores
- **Características**:
  - Vista general de estadísticas del sistema
  - Gestión de usuarios y eventos
  - Configuración del sistema
  - Navegación intuitiva

### 2. Sistema de Gestión de Eventos

#### Events.jsx
- **Propósito**: Vista principal de eventos disponibles
- **Características**:
  - Grid responsivo de eventos populares
  - Sistema de filtros avanzado (ciudad, día, orden, categoría)
  - Barra de búsqueda en tiempo real
  - Navegación a detalles del evento
  - Diseño moderno con gradientes y efectos visuales

#### EventsInfo.jsx
- **Propósito**: Vista detallada de información de eventos
- **Características**:
  - Información completa del evento (descripción, horarios, precios)
  - Sistema de calificaciones y comentarios
  - Modal interactivo del mapa del evento
  - Formulario de comentarios de usuarios
  - Diseño visual atractivo con secciones diferenciadas

### 3. Sistema de Maquetación de Eventos

#### FloorPlanDesigner.jsx
- **Propósito**: Herramienta completa para diseñar layouts de eventos
- **Características**:
  - Canvas interactivo para diseño
  - Herramientas de dibujo (paredes, sillas, escenarios, puertas)
  - Sistema de undo/redo
  - Exportación e importación de diseños
  - Panel de propiedades para elementos
  - Navegación integrada

#### DrawingCanvas.jsx
- **Propósito**: Componente canvas para renderizado de elementos
- **Características**:
  - Renderizado SVG de elementos del diseño
  - Interacción con mouse (selección, movimiento)
  - Sistema de coordenadas y escalas
  - Medidas y guías visuales

### 4. Sistema de Solicitudes de Organizadores

#### EventRequestForm.jsx
- **Propósito**: Formulario simplificado para solicitud de habilitación como organizador
- **Características**:
  - Solo información de empresa (no detalles de eventos específicos)
  - Validación completa de campos requeridos
  - Subida de documentos (RUT, tríptico/brochure)
  - Mensajes de confirmación
  - Diseño profesional y accesible

### 5. Página de Inicio (Landing Page)

#### ladingPage.jsx
- **Propósito**: Página principal que presenta el servicio
- **Características**:
  - Hero section con llamada a acción
  - Sección de solicitud para organizadores
  - Información sobre beneficios del servicio
  - Navegación intuitiva
  - Diseño moderno con gradientes

## Sistema de Rutas

### Configuración en App.jsx
```jsx
<Routes>
  <Route path="/" element={<MainLayout><LadingPage /></MainLayout>} />
  <Route path="/landing-page" element={<MainLayout><LadingPage /></MainLayout>} />
  <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
  <Route path="/event-info" element={<MainLayout><EventsInfo /></MainLayout>} />
  <Route path="/FloorPlanDesigner" element={<FloorPlanDesigner />} />
  <Route path="/admin-login" element={<AdminLogin />} />
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/event-request" element={<EventRequestForm onBack={() => window.history.back()} />} />
</Routes>
```

### Navegación Principal

#### Nav.jsx
- **Propósito**: Barra de navegación principal
- **Características**:
  - Logo y branding
  - Enlaces a secciones principales
  - Botón de acceso administrativo
  - Diseño responsivo

## Flujo de Usuario

### Para Usuarios Finales
1. **Página de inicio** → Ven servicios disponibles
2. **Explorar eventos** → Ven listado filtrado de eventos
3. **Ver detalles** → Información completa + mapa del evento
4. **Reservar** → Proceso de reserva (futuro)

### Para Organizadores
1. **Página de inicio** → Solicitud de organizador
2. **Formulario** → Completar información de empresa
3. **Revisión** → Esperar aprobación administrativa
4. **Aprobación** → Acceso a creación de eventos

### Para Administradores
1. **Login administrativo** → Autenticación segura
2. **Dashboard** → Gestión completa del sistema
3. **Revisar solicitudes** → Aprobar/rechazar organizadores
4. **Gestión de eventos** → Supervisar y moderar

## Funciones Clave del Sistema

### 1. Gestión de Estado y Navegación

#### useState Hooks Principales
```jsx
// En Events.jsx - Gestión de filtros
const [activeFilter, setActiveFilter] = useState('Ciudad');
const [selectedCity, setSelectedCity] = useState('Bogotá');
const [selectedDay, setSelectedDay] = useState('Lunes');
const [searchTerm, setSearchTerm] = useState('');

// En EventsInfo.jsx - Gestión del modal del mapa
const [showMapModal, setShowMapModal] = useState(false);

// En FloorPlanDesigner.jsx - Gestión de herramientas
const [activeTool, setActiveTool] = useState('select');
const [units, setUnits] = useState('cm');
```

#### Sistema de Rutas (React Router)
```jsx
// Navegación programática
const navigate = useNavigate();
navigate('/event-info'); // Redirección al hacer clic en "Reservar"

// Links declarativos
<Link to="/events">Eventos</Link>
<Link to="/admin-login">Admin</Link>
```

### 2. Sistema de Filtros y Búsqueda

#### Función handleFilter en Events.jsx
```jsx
const handleFilter = () => {
  let filtered = popularEvents.filter(event => {
    // Filtro por ciudad
    if (selectedCity !== 'Bogotá' && event.city !== selectedCity) return false;

    // Filtro por día
    if (selectedDay !== 'Lunes' && event.day !== selectedDay) return false;

    // Filtro por categoría
    if (selectedCategory !== 'Todas' && event.category !== selectedCategory) return false;

    // Búsqueda por título
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });
  setFilteredEvents(filtered);
};
```

### 3. Sistema de Canvas Interactivo

#### DrawingCanvas.jsx - Funciones Principales
```jsx
// Renderizado de elementos
const renderElement = (element) => {
  switch (element.type) {
    case 'wall':
      return <WallElement key={element.id} element={element} />;
    case 'chair':
      return <ChairElement key={element.id} element={element} />;
    case 'stage':
      return <StageElement key={element.id} element={element} />;
    // ... más tipos
  }
};

// Manejo de eventos del mouse
const handleMouseDown = (e) => {
  const point = getMousePos(e);
  // Lógica de selección y creación
};

const handleMouseMove = (e) => {
  // Lógica de arrastre y redimensionamiento
};
```

#### useDragAndDrop Hook
```jsx
// Sistema de arrastre personalizado
const useDragAndDrop = (elements, onUpdate) => {
  const [draggedElement, setDraggedElement] = useState(null);

  const handleMouseDown = (elementId) => {
    setDraggedElement(elementId);
  };

  const handleMouseMove = (deltaX, deltaY) => {
    if (draggedElement) {
      onUpdate(draggedElement, {
        x: elements[draggedElement].x + deltaX,
        y: elements[draggedElement].y + deltaY
      });
    }
  };

  return { handleMouseDown, handleMouseMove };
};
```

### 4. Sistema de Historial (Undo/Redo)

#### useHistory Hook
```jsx
const useHistory = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = (newState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return {
    state: history[currentIndex],
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};
```

### 5. Validación de Formularios

#### EventRequestForm.jsx - Validación Compleja
```jsx
const validateForm = () => {
  const errors = {};

  // Validación de email
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email inválido';
  }

  // Validación de teléfono
  if (!formData.phone || formData.phone.length < 10) {
    errors.phone = 'Teléfono debe tener al menos 10 dígitos';
  }

  // Validación de archivos
  if (!formData.rutFile) {
    errors.rutFile = 'Debe subir el RUT';
  }

  if (!formData.brochureFile) {
    errors.brochureFile = 'Debe subir el tríptico/brochure';
  }

  return errors;
};
```

### 6. Sistema de Modal Interactivo

#### EventsInfo.jsx - Modal del Mapa
```jsx
// Estado del modal
const [showMapModal, setShowMapModal] = useState(false);

// Elementos de ejemplo para el mapa
const sampleElements = [
  // Paredes del recinto
  { id: 'wall1', type: 'wall', x1: 100, y1: 100, x2: 800, y2: 100, thickness: 15, stroke: '#333' },

  // Escenario
  { id: 'stage', type: 'stage', x: 300, y: 150, width: 300, height: 80, fill: '#8b5cf6', stroke: '#6b46c1' },

  // Filas de asientos (70 asientos total)
  // ... elementos de sillas

  // Puertas y salidas
  { id: 'door1', type: 'door', x: 350, y: 50, width: 60, height: 15, fill: '#10b981', stroke: '#059669' }
];

// Renderizado del modal
{showMapModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
      {/* Header del modal */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Mapa del Evento</h2>
        <button onClick={() => setShowMapModal(false)}>
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Contenido del modal */}
      <div className="p-6 flex justify-center items-center min-h-[600px]">
        <DrawingCanvas
          elements={sampleElements}
          selectedElementId={null}
          onSelect={() => {}}
          onCreate={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          activeTool="select"
          setActiveTool={() => {}}
          units="cm"
          showMeasurements={true}
        />
      </div>
    </div>
  </div>
)}
```

### 7. Context API para Estado Global

#### MapContext.jsx
```jsx
// Contexto para el estado del canvas
const MapContext = createContext();

// Provider del contexto
export const MapProvider = ({ children }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const dispatch = (action) => {
    switch (action.type) {
      case 'SET_ELEMENTS':
        setElements(action.payload);
        break;
      case 'SET_SELECTED':
        setSelectedId(action.payload);
        break;
      case 'ADD_ELEMENT':
        setElements(prev => [...prev, action.payload]);
        break;
      // ... más acciones
    }
  };

  return (
    <MapContext.Provider value={{ elements, selectedId, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

// Hooks personalizados
export const useMapState = () => useContext(MapContext);
export const useMapDispatch = () => {
  const { dispatch } = useContext(MapContext);
  return dispatch;
};
```

### 8. Sistema de Exportación/Importación

#### FloorPlanDesigner.jsx - Funciones de Exportación
```jsx
const exportMap = useCallback(() => {
  const data = {
    exportedAt: new Date().toISOString(),
    elements: elements
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `map-export-${new Date().toISOString()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}, [elements]);

const importMap = useCallback((file) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.elements) {
        dispatch({ type: 'SET_ELEMENTS', payload: data.elements });
        historyWrapper.pushState(data.elements);
      }
    } catch (err) {
      console.error('Error de importación', err);
    }
  };
  reader.readAsText(file);
}, []);
```

## Características Técnicas

### Estado y Gestión de Datos
- **useState**: Gestión de estado local en componentes
- **Context API**: Estado global para elementos del canvas
- **Local Storage**: Persistencia de preferencias (futuro)

### Validación de Formularios
- **Validación en tiempo real**: Feedback inmediato al usuario
- **Validación de tipos**: Email, archivos, fechas
- **Mensajes de error**: Descriptivos y localizados

### Diseño y UX
- **Tailwind CSS**: Sistema de diseño consistente
- **Responsive Design**: Adaptable a todos los dispositivos
- **Animaciones**: Transiciones suaves con Framer Motion
- **Accesibilidad**: Contraste adecuado, navegación por teclado

### Optimización
- **Lazy Loading**: Carga diferida de componentes
- **Bundle Splitting**: Separación de código por rutas
- **Tree Shaking**: Eliminación de código no utilizado

## API y Backend Integration

### Endpoints Planificados
- `POST /api/auth/admin/login` - Login administrativo
- `GET /api/events` - Listado de eventos
- `POST /api/organizer-requests` - Solicitudes de organizadores
- `GET /api/event-layouts` - Diseños de eventos

### Manejo de Errores
- **Try/Catch**: Captura de errores en operaciones asíncronas
- **Estados de carga**: Indicadores visuales durante requests
- **Mensajes de error**: Feedback claro al usuario

## Testing y Calidad

### ESLint Configuration
```javascript
{
  "files": ["**/*.{js,jsx}"],
  "extends": [
    "js.configs.recommended",
    "reactHooks.configs.recommended-latest",
    "reactRefresh.vite"
  ],
  "rules": {
    "no-unused-vars": ["error", { "varsIgnorePattern": "^[A-Z_]" }]
  }
}
```

### Próximas Implementaciones

1. **Integración con Backend**
   - Conexión real con APIs
   - Autenticación JWT
   - Manejo de sesiones

2. **Funcionalidades Avanzadas**
   - Sistema de pagos
   - Notificaciones push
   - Chat en tiempo real

3. **Optimizaciones**
   - PWA capabilities
   - Service workers
   - Offline support

## Conclusión

El proyecto TuEvento Frontend Web representa una aplicación completa y moderna para la gestión de eventos, con una arquitectura sólida, diseño atractivo y funcionalidades bien definidas para todos los tipos de usuarios. La implementación sigue las mejores prácticas de desarrollo React y proporciona una base escalable para futuras expansiones.

---

**Fecha de documentación**: Septiembre 2025
**Versión**: 1.0.0
**Estado**: Desarrollo completado