// Ejemplo de estructura de layout para el sistema de diseño de planos de eventos TuEvento
// Esta estructura representa un layout completo con secciones, filas y asientos

const eventLayoutExample = {
  eventId: 123, // ID del evento
  name: "Concierto de Rock",
  venue: "Estadio Municipal",

  // Estructura del layout
  layout: {
    // Elementos del canvas (paredes, puertas, escenario, etc.)
    elements: [
      {
        id: "stage-main",
        type: "stage",
        x: 300,
        y: 50,
        width: 400,
        height: 80,
        fill: "url(#stageGradient)",
        stroke: "#ef4444",
        meta: {
          label: "Escenario Principal"
        }
      },
      {
        id: "wall-front",
        type: "wall",
        x1: 100,
        y1: 150,
        x2: 700,
        y2: 150,
        thickness: 15,
        stroke: "#475569",
        meta: {
          label: "Pared Frontal"
        }
      },
      {
        id: "wall-left",
        type: "wall",
        x1: 100,
        y1: 50,
        x2: 100,
        y2: 600,
        thickness: 15,
        stroke: "#475569",
        meta: {
          label: "Pared Izquierda"
        }
      },
      {
        id: "wall-right",
        type: "wall",
        x1: 700,
        y1: 50,
        x2: 700,
        y2: 600,
        thickness: 15,
        stroke: "#475569",
        meta: {
          label: "Pared Derecha"
        }
      },
      {
        id: "wall-back",
        type: "wall",
        x1: 100,
        y1: 600,
        x2: 700,
        y2: 600,
        thickness: 15,
        stroke: "#475569",
        meta: {
          label: "Pared Trasera"
        }
      },
      {
        id: "door-main",
        type: "door",
        x: 400,
        y: 600,
        width: 80,
        height: 20,
        fill: "transparent",
        stroke: "#374151",
        meta: {
          label: "Entrada Principal"
        }
      },
      {
        id: "exit-emergency-left",
        type: "exit",
        x: 150,
        y: 50,
        width: 40,
        height: 40,
        fill: "url(#exitPattern)",
        stroke: "#f59e0b",
        meta: {
          label: "Salida Emergencia Izquierda"
        }
      },
      {
        id: "exit-emergency-right",
        type: "exit",
        x: 650,
        y: 50,
        width: 40,
        height: 40,
        fill: "url(#exitPattern)",
        stroke: "#f59e0b",
        meta: {
          label: "Salida Emergencia Derecha"
        }
      }
    ],

    // Secciones del evento con filas y asientos
    sections: [
      {
        id: 1,
        name: "VIP",
        category: "VIP",
        price: 150.00,
        x: 200,
        y: 200,
        width: 300,
        height: 120,
        color: "#8b5cf6",
        fill: "url(#sectionGradient)",
        stroke: "#8b5cf6",
        rows: [
          {
            id: "row-vip-a",
            name: "Fila A",
            row: "A",
            x: 200,
            y: 220,
            width: 280,
            height: 20,
            seats: [
              {
                id: 1,
                seatNumber: "A1",
                row: "A",
                x: 210,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 2,
                seatNumber: "A2",
                row: "A",
                x: 240,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 3,
                seatNumber: "A3",
                row: "A",
                x: 270,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 4,
                seatNumber: "A4",
                row: "A",
                x: 300,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 5,
                seatNumber: "A5",
                row: "A",
                x: 330,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 6,
                seatNumber: "A6",
                row: "A",
                x: 360,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 7,
                seatNumber: "A7",
                row: "A",
                x: 390,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 8,
                seatNumber: "A8",
                row: "A",
                x: 420,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 9,
                seatNumber: "A9",
                row: "A",
                x: 450,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 10,
                seatNumber: "A10",
                row: "A",
                x: 480,
                y: 225,
                status: "AVAILABLE",
                price: 150.00
              }
            ]
          },
          {
            id: "row-vip-b",
            name: "Fila B",
            row: "B",
            x: 200,
            y: 250,
            width: 280,
            height: 20,
            seats: [
              {
                id: 11,
                seatNumber: "B1",
                row: "B",
                x: 210,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 12,
                seatNumber: "B2",
                row: "B",
                x: 240,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 13,
                seatNumber: "B3",
                row: "B",
                x: 270,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 14,
                seatNumber: "B4",
                row: "B",
                x: 300,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 15,
                seatNumber: "B5",
                row: "B",
                x: 330,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 16,
                seatNumber: "B6",
                row: "B",
                x: 360,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 17,
                seatNumber: "B7",
                row: "B",
                x: 390,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 18,
                seatNumber: "B8",
                row: "B",
                x: 420,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 19,
                seatNumber: "B9",
                row: "B",
                x: 450,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              },
              {
                id: 20,
                seatNumber: "B10",
                row: "B",
                x: 480,
                y: 255,
                status: "AVAILABLE",
                price: 150.00
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "General",
        category: "General",
        price: 50.00,
        x: 150,
        y: 350,
        width: 500,
        height: 200,
        color: "#22c55e",
        fill: "url(#sectionPattern)",
        stroke: "#22c55e",
        rows: [
          {
            id: "row-general-c",
            name: "Fila C",
            row: "C",
            x: 150,
            y: 370,
            width: 480,
            height: 20,
            seats: [
              {
                id: 21,
                seatNumber: "C1",
                row: "C",
                x: 160,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 22,
                seatNumber: "C2",
                row: "C",
                x: 190,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 23,
                seatNumber: "C3",
                row: "C",
                x: 220,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 24,
                seatNumber: "C4",
                row: "C",
                x: 250,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 25,
                seatNumber: "C5",
                row: "C",
                x: 280,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 26,
                seatNumber: "C6",
                row: "C",
                x: 310,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 27,
                seatNumber: "C7",
                row: "C",
                x: 340,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 28,
                seatNumber: "C8",
                row: "C",
                x: 370,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 29,
                seatNumber: "C9",
                row: "C",
                x: 400,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 30,
                seatNumber: "C10",
                row: "C",
                x: 430,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 31,
                seatNumber: "C11",
                row: "C",
                x: 460,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 32,
                seatNumber: "C12",
                row: "C",
                x: 490,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 33,
                seatNumber: "C13",
                row: "C",
                x: 520,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 34,
                seatNumber: "C14",
                row: "C",
                x: 550,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 35,
                seatNumber: "C15",
                row: "C",
                x: 580,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 36,
                seatNumber: "C16",
                row: "C",
                x: 610,
                y: 375,
                status: "AVAILABLE",
                price: 50.00
              }
            ]
          },
          {
            id: "row-general-d",
            name: "Fila D",
            row: "D",
            x: 150,
            y: 400,
            width: 480,
            height: 20,
            seats: [
              {
                id: 37,
                seatNumber: "D1",
                row: "D",
                x: 160,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 38,
                seatNumber: "D2",
                row: "D",
                x: 190,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 39,
                seatNumber: "D3",
                row: "D",
                x: 220,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 40,
                seatNumber: "D4",
                row: "D",
                x: 250,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 41,
                seatNumber: "D5",
                row: "D",
                x: 280,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 42,
                seatNumber: "D6",
                row: "D",
                x: 310,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 43,
                seatNumber: "D7",
                row: "D",
                x: 340,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 44,
                seatNumber: "D8",
                row: "D",
                x: 370,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 45,
                seatNumber: "D9",
                row: "D",
                x: 400,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 46,
                seatNumber: "D10",
                row: "D",
                x: 430,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 47,
                seatNumber: "D11",
                row: "D",
                x: 460,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 48,
                seatNumber: "D12",
                row: "D",
                x: 490,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 49,
                seatNumber: "D13",
                row: "D",
                x: 520,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 50,
                seatNumber: "D14",
                row: "D",
                x: 550,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 51,
                seatNumber: "D15",
                row: "D",
                x: 580,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 52,
                seatNumber: "D16",
                row: "D",
                x: 610,
                y: 405,
                status: "AVAILABLE",
                price: 50.00
              }
            ]
          },
          {
            id: "row-general-e",
            name: "Fila E",
            row: "E",
            x: 150,
            y: 430,
            width: 480,
            height: 20,
            seats: [
              {
                id: 53,
                seatNumber: "E1",
                row: "E",
                x: 160,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 54,
                seatNumber: "E2",
                row: "E",
                x: 190,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 55,
                seatNumber: "E3",
                row: "E",
                x: 220,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 56,
                seatNumber: "E4",
                row: "E",
                x: 250,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 57,
                seatNumber: "E5",
                row: "E",
                x: 280,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 58,
                seatNumber: "E6",
                row: "E",
                x: 310,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 59,
                seatNumber: "E7",
                row: "E",
                x: 340,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 60,
                seatNumber: "E8",
                row: "E",
                x: 370,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 61,
                seatNumber: "E9",
                row: "E",
                x: 400,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 62,
                seatNumber: "E10",
                row: "E",
                x: 430,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 63,
                seatNumber: "E11",
                row: "E",
                x: 460,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 64,
                seatNumber: "E12",
                row: "E",
                x: 490,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 65,
                seatNumber: "E13",
                row: "E",
                x: 520,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 66,
                seatNumber: "E14",
                row: "E",
                x: 550,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 67,
                seatNumber: "E15",
                row: "E",
                x: 580,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 68,
                seatNumber: "E16",
                row: "E",
                x: 610,
                y: 435,
                status: "AVAILABLE",
                price: 50.00
              }
            ]
          }
        ]
      }
    ],

    // Información adicional del layout
    metadata: {
      createdAt: "2025-09-24T02:00:00.000Z",
      lastModified: "2025-09-24T02:30:00.000Z",
      totalSeats: 68,
      availableSeats: 67,
      occupiedSeats: 1,
      reservedSeats: 0,
      dimensions: {
        width: 800,
        height: 650,
        units: "px"
      }
    }
  },

  // Configuración de selección de asientos
  seatSelection: {
    maxSeatsPerBooking: 8,
    allowAdjacentSeats: true,
    bookingTimeout: 300, // segundos
    realTimeUpdates: true
  }
};

// Función para obtener asientos disponibles en una sección
function getAvailableSeatsInSection(sectionId) {
  const section = eventLayoutExample.layout.sections.find(s => s.id === sectionId);
  if (!section) return [];

  return section.rows.flatMap(row =>
    row.seats.filter(seat => seat.status === 'AVAILABLE')
  );
}

// Función para reservar asientos
function reserveSeats(seatIds) {
  seatIds.forEach(seatId => {
    // Encontrar el asiento y cambiar su estado
    eventLayoutExample.layout.sections.forEach(section => {
      section.rows.forEach(row => {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat && seat.status === 'AVAILABLE') {
          seat.status = 'RESERVED';
        }
      });
    });
  });

  // Actualizar contadores
  updateSeatCounts();
}

// Función para actualizar contadores de asientos
function updateSeatCounts() {
  let available = 0, occupied = 0, reserved = 0;

  eventLayoutExample.layout.sections.forEach(section => {
    section.rows.forEach(row => {
      row.seats.forEach(seat => {
        switch (seat.status) {
          case 'AVAILABLE': available++; break;
          case 'OCCUPIED': occupied++; break;
          case 'RESERVED': reserved++; break;
        }
      });
    });
  });

  eventLayoutExample.layout.metadata.availableSeats = available;
  eventLayoutExample.layout.metadata.occupiedSeats = occupied;
  eventLayoutExample.layout.metadata.reservedSeats = reserved;
}

export default eventLayoutExample;