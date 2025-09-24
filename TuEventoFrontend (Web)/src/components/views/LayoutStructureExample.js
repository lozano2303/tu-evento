// Ejemplo de estructura de layout para el sistema de diseño de planos de eventos TuEvento
// Esta estructura representa un layout completo con secciones, filas y asientos

const eventLayoutExample = {
  eventId: 123, // ID del evento
  name: "Concierto de Rock",
  venue: "Estadio Municipal",

  // Estructura del layout
  layout: {
    // Elementos del canvas (paredes, puertas, etc.)
    elements: [
      {
        id: "wall-1",
        type: "wall",
        x1: 100,
        y1: 100,
        x2: 500,
        y2: 100,
        thickness: 15,
        stroke: "#475569",
        meta: { label: "Pared Frontal" }
      },
      {
        id: "door-1",
        type: "door",
        x: 300,
        y: 100,
        width: 100,
        height: 20,
        meta: { label: "Entrada Principal" }
      }
    ],

    // Secciones del evento
    sections: [
      {
        id: 1,
        name: "VIP",
        category: "VIP",
        price: 150.00,
        x: 150,
        y: 150,
        width: 200,
        height: 100,
        color: "#8b5cf6",
        rows: [
          {
            id: "row-vip-1",
            name: "Fila A",
            seats: [
              {
                id: 1,
                seatNumber: "A1",
                row: "A",
                x: 160,
                y: 160,
                status: "AVAILABLE", // AVAILABLE, OCCUPIED, RESERVED
                price: 150.00
              },
              {
                id: 2,
                seatNumber: "A2",
                row: "A",
                x: 190,
                y: 160,
                status: "AVAILABLE",
                price: 150.00
              },
              // ... más asientos
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
        y: 300,
        width: 300,
        height: 200,
        color: "#22c55e",
        rows: [
          {
            id: "row-gen-1",
            name: "Fila B",
            seats: [
              {
                id: 3,
                seatNumber: "B1",
                row: "B",
                x: 160,
                y: 310,
                status: "AVAILABLE",
                price: 50.00
              },
              {
                id: 4,
                seatNumber: "B2",
                row: "B",
                x: 190,
                y: 310,
                status: "OCCUPIED",
                price: 50.00
              },
              // ... más asientos
            ]
          },
          {
            id: "row-gen-2",
            name: "Fila C",
            seats: [
              // ... asientos de fila C
            ]
          }
        ]
      }
    ],

    // Información adicional del layout
    metadata: {
      createdAt: "2025-09-24T02:00:00.000Z",
      lastModified: "2025-09-24T02:30:00.000Z",
      totalSeats: 500,
      availableSeats: 450,
      occupiedSeats: 40,
      reservedSeats: 10,
      dimensions: {
        width: 600,
        height: 400,
        units: "cm"
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