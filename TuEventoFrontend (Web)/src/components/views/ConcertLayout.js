// Maquetación de concierto profesional para TuEvento
// Layout de concierto con escenario, secciones VIP, General y Estudiante
// Capacidad aproximada: 150 personas

export const concertLayout = {
  elements: [
    // ESCENARIO PRINCIPAL
    {
      id: "stage-1",
      type: "stage",
      x: 500,
      y: 80,
      width: 300,
      height: 60,
      fill: "url(#stageGradient)",
      stroke: "#ef4444",
      meta: {
        label: "Escenario Principal",
        category: "Stage"
      }
    },

    // SECCIONES VIP (más cercanas al escenario)
    {
      id: "vip-section-1",
      type: "section",
      x: 350,
      y: 180,
      width: 120,
      height: 80,
      fill: "url(#sectionGradient)",
      stroke: "#8b5cf6",
      meta: {
        label: "VIP Izquierda",
        price: 80,
        category: "VIP"
      }
    },
    {
      id: "vip-section-2",
      type: "section",
      x: 500,
      y: 180,
      width: 120,
      height: 80,
      fill: "url(#sectionGradient)",
      stroke: "#8b5cf6",
      meta: {
        label: "VIP Centro",
        price: 80,
        category: "VIP"
      }
    },
    {
      id: "vip-section-3",
      type: "section",
      x: 650,
      y: 180,
      width: 120,
      height: 80,
      fill: "url(#sectionGradient)",
      stroke: "#8b5cf6",
      meta: {
        label: "VIP Derecha",
        price: 80,
        category: "VIP"
      }
    },

    // FILAS VIP
    {
      id: "vip-row-1",
      type: "seatRow",
      x: 350,
      y: 220,
      width: 100,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila VIP A",
        row: "A"
      }
    },
    {
      id: "vip-row-2",
      type: "seatRow",
      x: 500,
      y: 220,
      width: 100,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila VIP B",
        row: "B"
      }
    },
    {
      id: "vip-row-3",
      type: "seatRow",
      x: 650,
      y: 220,
      width: 100,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila VIP C",
        row: "C"
      }
    },

    // SECCIONES GENERAL (zona media)
    {
      id: "general-section-1",
      type: "section",
      x: 300,
      y: 280,
      width: 150,
      height: 100,
      fill: "url(#sectionPattern)",
      stroke: "#3b82f6",
      meta: {
        label: "General Izquierda",
        price: 50,
        category: "General"
      }
    },
    {
      id: "general-section-2",
      type: "section",
      x: 500,
      y: 280,
      width: 150,
      height: 100,
      fill: "url(#sectionPattern)",
      stroke: "#3b82f6",
      meta: {
        label: "General Centro",
        price: 50,
        category: "General"
      }
    },
    {
      id: "general-section-3",
      type: "section",
      x: 700,
      y: 280,
      width: 150,
      height: 100,
      fill: "url(#sectionPattern)",
      stroke: "#3b82f6",
      meta: {
        label: "General Derecha",
        price: 50,
        category: "General"
      }
    },

    // FILAS GENERAL
    {
      id: "general-row-1",
      type: "seatRow",
      x: 300,
      y: 330,
      width: 130,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila General D",
        row: "D"
      }
    },
    {
      id: "general-row-2",
      type: "seatRow",
      x: 500,
      y: 330,
      width: 130,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila General E",
        row: "E"
      }
    },
    {
      id: "general-row-3",
      type: "seatRow",
      x: 700,
      y: 330,
      width: 130,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila General F",
        row: "F"
      }
    },

    // SECCIONES ESTUDIANTE (zona trasera)
    {
      id: "student-section-1",
      type: "section",
      x: 250,
      y: 380,
      width: 180,
      height: 120,
      fill: "url(#zonePattern)",
      stroke: "#10b981",
      meta: {
        label: "Estudiante Izquierda",
        price: 25,
        category: "Estudiante"
      }
    },
    {
      id: "student-section-2",
      type: "section",
      x: 500,
      y: 380,
      width: 180,
      height: 120,
      fill: "url(#zonePattern)",
      stroke: "#10b981",
      meta: {
        label: "Estudiante Centro",
        price: 25,
        category: "Estudiante"
      }
    },
    {
      id: "student-section-3",
      type: "section",
      x: 750,
      y: 380,
      width: 180,
      height: 120,
      fill: "url(#zonePattern)",
      stroke: "#10b981",
      meta: {
        label: "Estudiante Derecha",
        price: 25,
        category: "Estudiante"
      }
    },

    // FILAS ESTUDIANTE
    {
      id: "student-row-1",
      type: "seatRow",
      x: 250,
      y: 440,
      width: 160,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila Estudiante G",
        row: "G"
      }
    },
    {
      id: "student-row-2",
      type: "seatRow",
      x: 500,
      y: 440,
      width: 160,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila Estudiante H",
        row: "H"
      }
    },
    {
      id: "student-row-3",
      type: "seatRow",
      x: 750,
      y: 440,
      width: 160,
      height: 20,
      fill: "url(#seatRowPattern)",
      stroke: "#22c55e",
      meta: {
        label: "Fila Estudiante I",
        row: "I"
      }
    },

    // PAREDES Y ELEMENTOS ESTRUCTURALES
    {
      id: "wall-left",
      type: "wall",
      x1: 100,
      y1: 50,
      x2: 100,
      y2: 550,
      stroke: "#6b7280",
      strokeWidth: 3,
      thickness: 15,
      meta: {
        label: "Pared Izquierda"
      }
    },
    {
      id: "wall-right",
      type: "wall",
      x1: 900,
      y1: 50,
      x2: 900,
      y2: 550,
      stroke: "#6b7280",
      strokeWidth: 3,
      thickness: 15,
      meta: {
        label: "Pared Derecha"
      }
    },
    {
      id: "wall-back",
      type: "wall",
      x1: 100,
      y1: 550,
      x2: 900,
      y2: 550,
      stroke: "#6b7280",
      strokeWidth: 3,
      thickness: 15,
      meta: {
        label: "Pared Trasera"
      }
    },

    // PUERTAS DE ENTRADA
    {
      id: "entrance-door-1",
      type: "door",
      x: 200,
      y: 550,
      width: 50,
      height: 50,
      fill: "transparent",
      stroke: "#374151",
      meta: {
        label: "Entrada Principal Izquierda"
      }
    },
    {
      id: "entrance-door-2",
      type: "door",
      x: 500,
      y: 550,
      width: 50,
      height: 50,
      fill: "transparent",
      stroke: "#374151",
      meta: {
        label: "Entrada Principal Centro"
      }
    },
    {
      id: "entrance-door-3",
      type: "door",
      x: 800,
      y: 550,
      width: 50,
      height: 50,
      fill: "transparent",
      stroke: "#374151",
      meta: {
        label: "Entrada Principal Derecha"
      }
    },

    // SALIDAS DE EMERGENCIA
    {
      id: "exit-1",
      type: "exit",
      x: 150,
      y: 50,
      width: 40,
      height: 40,
      fill: "url(#exitPattern)",
      stroke: "#f59e0b",
      meta: {
        label: "Salida Emergencia 1"
      }
    },
    {
      id: "exit-2",
      type: "exit",
      x: 850,
      y: 50,
      width: 40,
      height: 40,
      fill: "url(#exitPattern)",
      stroke: "#f59e0b",
      meta: {
        label: "Salida Emergencia 2"
      }
    }
  ],
  exportedAt: new Date().toISOString(),
  name: "Concierto Profesional TuEvento",
  description: "Layout de concierto con 150 asientos distribuidos en secciones VIP, General y Estudiante"
};

// Función para cargar este layout en el diseñador
export const loadConcertLayout = (dispatch, historyWrapper) => {
  dispatch({ type: 'SET_ELEMENTS', payload: concertLayout.elements });
  historyWrapper.pushState(concertLayout.elements);
  console.log('Layout de concierto cargado exitosamente');
};