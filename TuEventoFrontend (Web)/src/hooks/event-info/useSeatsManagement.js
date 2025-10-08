import { useState, useEffect, useMemo, useCallback } from 'react';
import { getSeatsBySection, updateSeatStatus, createSeat, releaseExpiredReservations } from '../../services/SeatService.js';
import { getAllSections, createSection } from '../../services/SectionService.js';
import { getAllSectionNames } from '../../services/SectionNameService.js';
import { getEventLayoutByEventId } from '../../services/EventLayoutService.js';
import { createTicketWithSeats } from '../../services/TicketService.js';

export const useSeatsManagement = (eventId, checkSession) => {
  const MAX_SEATS_PER_PURCHASE = 10;
  const DEFAULT_SEAT_PRICE = 30000;

  const [layoutElements, setLayoutElements] = useState([]);
  const [layoutId, setLayoutId] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservingSeats, setReservingSeats] = useState(false);
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showMapModal, setShowMapModal] = useState(false);

  const selectedSeatDetails = useMemo(() => {
    const sectionPrice = selectedSection?.price || DEFAULT_SEAT_PRICE;
    return selectedSeats.map(seatId => {
      const seat = seats.find(s => s.id === seatId);
      return seat ? {
        key: seatId,
        row: seat.row,
        seatNumber: seat.seatNumber,
        price: sectionPrice,
        seatId: seat.id
      } : null;
    }).filter(Boolean);
  }, [selectedSeats, seats, selectedSection]);

  const selectedSeatCount = useMemo(() => selectedSeatDetails.length, [selectedSeatDetails]);
  const totalPrice = useMemo(() => {
    return selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeatDetails]);

  const matchSeatsWithLayout = (layoutElements, seatsToMatch) => {
    console.log("Matching layout with seats:", { layoutElementsCount: layoutElements.length, seatsCount: seatsToMatch.length });
    console.log("Layout elements types:", layoutElements.map(el => ({ type: el.type, id: el.id, hasSeatPositions: el.seatPositions ? el.seatPositions.length : 0 })));
    console.log("Full layout elements:", JSON.stringify(layoutElements, null, 2));
    return layoutElements.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        console.log("Processing seatRow:", element.id, "with", element.seatPositions.length, "positions");
        const updatedPositions = element.seatPositions.map(pos => {
          console.log(`Checking position: row=${pos.row}, seatNumber=${pos.seatNumber}, current status=${pos.status}`);
          const matchingSeat = seatsToMatch.find(seat =>
            seat.row === pos.row && seat.seatNumber === pos.seatNumber
          );

          if (matchingSeat) {
            let realStatus;
            console.log(`Found matching seat ${matchingSeat.id}: row=${matchingSeat.row}, seatNumber=${matchingSeat.seatNumber}, status=${matchingSeat.status}, type=${typeof matchingSeat.status}`);

            if (typeof matchingSeat.status === 'boolean') {
              realStatus = matchingSeat.status ? "AVAILABLE" : "OCCUPIED";
            } else if (typeof matchingSeat.status === 'string') {
              realStatus = matchingSeat.status;
            } else {
              realStatus = "AVAILABLE";
            }

            console.log(`Setting seat ${matchingSeat.id} status to: ${realStatus}`);

            return {
              ...pos,
              status: realStatus,
              id: matchingSeat.id
            };
          }

          console.log(`No matching seat found for position row=${pos.row}, seatNumber=${pos.seatNumber}`);
          return {
            ...pos,
            status: "AVAILABLE"
          };
        });
        return { ...element, seatPositions: updatedPositions };
      }
      return element;
    });
  };

  const loadEventLayout = async (currentSeats = null) => {
    if (!eventId) return;

    try {
      setLoadingLayout(true);
      const result = await getEventLayoutByEventId(eventId);
      if (result.success && result.data && result.data.layoutData && result.data.layoutData.elements) {
        let elements = result.data.layoutData.elements;
        console.log("Layout elements cargados:", elements);
        console.log("Element types:", elements.map(el => ({ type: el.type, id: el.id, hasSeatPositions: el.seatPositions ? el.seatPositions.length : 0 })));

        let seatsToMatch = currentSeats;
        if (!seatsToMatch) {
          seatsToMatch = await loadSectionsAndSeats();
        }
        console.log("Matching with seats:", seatsToMatch);

        console.log("Before matchSeatsWithLayout - Layout elements:", elements);
        console.log("Seats to match:", seatsToMatch);
        elements = matchSeatsWithLayout(elements, seatsToMatch);
        console.log("After matchSeatsWithLayout - Layout elements:", elements);
        setLayoutElements(elements);
        setLayoutId(result.data.id);
      } else {
        setLayoutElements([]);
        setLayoutId(null);
      }
    } catch (error) {
      console.error('Error loading event layout:', error);
      setLayoutElements([]);
      setLayoutId(null);
    } finally {
      setLoadingLayout(false);
    }
  };

  const loadSections = async () => {
    if (!eventId) return;

    try {
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        let eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));

        console.log("Loaded sections:", eventSections);
        setSections(eventSections);
        if (eventSections.length > 0 && !selectedSection) {
          setSelectedSection(eventSections[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadSectionsAndSeats = async () => {
    console.log("loadSectionsAndSeats called for eventId:", eventId);
    if (!eventId) return [];

    try {
      const sectionNamesResult = await getAllSectionNames();
      const sectionNamesMap = {};
      if (sectionNamesResult.success) {
        sectionNamesResult.data.forEach(sn => {
          sectionNamesMap[sn.sectionNameID] = sn.name;
        });
        console.log("Section names loaded:", sectionNamesMap);
      }

      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        let eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));

        console.log("Raw sections:", eventSections);
        eventSections = eventSections.map(section => {
          const displayName = sectionNamesMap[section.sectionNameID] || section.sectionName || 'Sección';
          console.log(`Section ${section.sectionID}: sectionNameID=${section.sectionNameID}, displayName=${displayName}`);
          return {
            ...section,
            displayName: displayName
          };
        });

        if (eventSections.length === 0) {
          const defaultSection = {
            eventId: parseInt(eventId),
            sectionName: 'General',
            price: DEFAULT_SEAT_PRICE,
            displayName: 'General'
          };
          const createResult = await createSection(defaultSection);
          if (createResult.success && createResult.data) {
            eventSections = [{
              ...createResult.data,
              displayName: sectionNamesMap[createResult.data.sectionNameID] || createResult.data.sectionName || 'General'
            }];
          } else {
            console.error('Failed to create default section');
            return [];
          }
        }

        setSections(eventSections);
        if (eventSections.length > 0) {
          setSelectedSection(eventSections[0]);

          const allSeatsPromises = eventSections.map(section => loadSeatsForSection(section.sectionID));
          const allSeatsResults = await Promise.all(allSeatsPromises);
          const allSeats = allSeatsResults.flat();
          setSeats(allSeats);
          setLastUpdate(Date.now());
          return allSeats;
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
    return [];
  };

  const loadSeatsForSection = async (sectionId) => {
    try {
      const seatsResult = await getSeatsBySection(sectionId);
      if (seatsResult.success) {
        console.log("Seats cargados:", seatsResult.data);
        setSeats(seatsResult.data);
        setLastUpdate(Date.now());
        return seatsResult.data;
      }
    } catch (error) {
      console.error('Error loading seats:', error);
    }
    return [];
  };

  const generateSeatsFromLayout = async (layoutElements) => {
    if (!selectedSection || !layoutElements) return;

    try {
      const seatRows = layoutElements
        .filter(el => el.type === 'seatRow')
        .sort((a, b) => b.y - a.y);
      console.log("Generando seats para seatRows ordenados:", seatRows.length);

      const existingSeats = await getSeatsBySection(selectedSection.sectionID);
      const existingSeatsData = existingSeats.success ? existingSeats.data : [];

      for (let i = 0; i < seatRows.length; i++) {
        const seatRow = seatRows[i];
        const rowLetter = String.fromCharCode(65 + i);
        if (seatRow.seatPositions) {
          console.log("Procesando seats para row:", rowLetter, "con", seatRow.seatPositions.length, "posiciones");

          for (let j = 0; j < seatRow.seatPositions.length; j++) {
            const seatPos = seatRow.seatPositions[j];
            const x = Math.round(seatPos.x);
            const y = Math.round(seatPos.y);
            const seatNumber = (j + 1).toString();

            const existingSeat = existingSeatsData.find(seat => Math.round(seat.x) === x && Math.round(seat.y) === y);

            if (existingSeat) {
              const updateData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: existingSeat.status ? "AVAILABLE" : "OCCUPIED",
                sectionID: selectedSection.sectionID,
                eventLayoutID: layoutId,
                x: x,
                y: y
              };
              try {
                await updateSeat(existingSeat.seatID, updateData);
                console.log("Seat actualizado:", updateData);
              } catch (error) {
                console.log('Error actualizando seat:', error);
              }
            } else {
              const seatData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: "AVAILABLE",
                sectionID: selectedSection.sectionID,
                eventLayoutID: layoutId,
                x: x,
                y: y
              };
              try {
                await createSeat(seatData);
                console.log("Seat creado:", seatData);
              } catch (error) {
                console.log('Seat might already exist:', error);
              }
            }
          }
        }
      }

      if (selectedSection) {
        loadSeatsForSection(selectedSection.sectionID);
      }
    } catch (error) {
      console.error('Error generating seats from layout:', error);
    }
  };

  const handleSeatSelect = (seatId) => {
    console.log("Asiento clickeado:", seatId);
    const seat = seats.find(s => s.id === seatId);
    if (!seat) {
      console.log("Asiento no encontrado:", seatId);
      return;
    }
    if (seat.status !== "AVAILABLE") {
      console.log("Asiento no disponible:", seatId);
      return;
    }
    if (seat.sectionID !== selectedSection?.sectionID) {
      console.log("Asiento no pertenece a la sección seleccionada:", seatId);
      return;
    }
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
    console.log("Asientos seleccionados:", selectedSeats);
  };

  const handleSeatPositionSelect = (seatRowId, seatIndex) => {
    const element = layoutElements.find(el => el.id === seatRowId);
    if (element && element.seatPositions && element.seatPositions[seatIndex]) {
      const pos = element.seatPositions[seatIndex];
      const seat = seats.find(s => s.row === pos.row && s.seatNumber === pos.seatNumber);
      if (seat && seat.status === "AVAILABLE") {
        setSelectedSeats(prev => {
          if (prev.includes(seat.id)) {
            return prev.filter(id => id !== seat.id);
          } else {
            return [...prev, seat.id];
          }
        });
      }
    }
  };

  const verifySeatAvailability = async (seatIds) => {
    try {
      const currentSeats = await getSeatsBySection(selectedSection.sectionID);
      if (!currentSeats.success) {
        throw new Error('No se pudo verificar la disponibilidad de asientos');
      }
      const availableSeats = currentSeats.data.filter(seat => seat.status === 'AVAILABLE').map(seat => seat.id);
      const unavailableSeats = seatIds.filter(id => !availableSeats.includes(id));
      return { available: unavailableSeats.length === 0, unavailableSeats };
    } catch (error) {
      console.error('Error verifying seat availability:', error);
      throw error;
    }
  };

  const handlePurchaseSeats = async (event) => {
    if (!checkSession()) return;

    const allSeatIds = selectedSeatDetails.map(s => s.seatId).filter(id => id);

    if (allSeatIds.length === 0) {
      alert('Por favor, selecciona al menos un asiento.');
      return;
    }

    if (allSeatIds.length > MAX_SEATS_PER_PURCHASE) {
      alert(`No puedes seleccionar más de ${MAX_SEATS_PER_PURCHASE} asientos por reserva.`);
      return;
    }

    if (new Set(allSeatIds).size !== allSeatIds.length) {
      alert('Hay asientos duplicados en la selección. Por favor, verifica.');
      return;
    }

    if (event && new Date(event.endDate) < new Date()) {
      alert('Este evento ya ha finalizado.');
      return;
    }

    const availabilityPromise = verifySeatAvailability(allSeatIds);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );

    try {
      const availabilityCheck = await Promise.race([availabilityPromise, timeoutPromise]);
      if (!availabilityCheck.available) {
        alert(`Los siguientes asientos ya no están disponibles: ${availabilityCheck.unavailableSeats.join(', ')}. La selección se actualizará.`);
        setSelectedSeats(prev => prev.filter(id => !availabilityCheck.unavailableSeats.includes(id)));
        if (selectedSection) {
          await loadSeatsForSection(selectedSection.id);
        }
        return;
      }
    } catch (error) {
      if (error.message === 'Timeout') {
        alert('La verificación de disponibilidad tardó demasiado. Inténtalo de nuevo.');
      } else {
        alert('Error al verificar disponibilidad. Inténtalo de nuevo.');
      }
      return;
    }

    setReservingSeats(true);
    const reservedSeats = [];
    let ticketCreated = false;

    try {
      const reservePromises = allSeatIds.map(seatId =>
        updateSeatStatus(seatId, 'RESERVED').then(result => {
          if (result.success) {
            reservedSeats.push(seatId);
            return { seatId, success: true };
          } else {
            return { seatId, success: false, error: result.message };
          }
        }).catch(error => ({ seatId, success: false, error: error.message }))
      );

      const reserveResults = await Promise.allSettled(reservePromises);
      const failedReserves = reserveResults.filter(result =>
        result.status === 'rejected' || !result.value.success
      );

      if (failedReserves.length > 0) {
        const failedSeatIds = failedReserves.map(result =>
          result.status === 'fulfilled' ? result.value.seatId : 'desconocido'
        );
        throw new Error(`No se pudieron reservar los siguientes asientos: ${failedSeatIds.join(', ')}`);
      }

      const ticketData = {
        event: { id: parseInt(eventId) },
        seats: allSeatIds.map(seatId => ({ id: seatId })),
        quantity: allSeatIds.length
      };

      const result = await createTicketWithSeats(ticketData);
      if (result.success) {
        ticketCreated = true;
        alert('¡Reserva realizada exitosamente! Revisa tu correo electrónico para el ticket con QR.');
        setSelectedSeats([]);
        setShowPurchaseModal(false);
        if (selectedSection) {
          setSeats(prevSeats =>
            prevSeats.map(seat =>
              allSeatIds.includes(seat.id)
                ? { ...seat, status: 'OCCUPIED' }
                : seat
            )
          );
          setLayoutElements(prevElements =>
            prevElements.map(element => {
              if (element.type === 'seatRow' && element.seatPositions) {
                const updatedPositions = element.seatPositions.map(pos => {
                  if (allSeatIds.includes(pos.id)) {
                    return { ...pos, status: 'OCCUPIED' };
                  }
                  return pos;
                });
                return { ...element, seatPositions: updatedPositions };
              }
              return element;
            })
          );
          await loadSeatsForSection(selectedSection.sectionID);
          await loadEventLayout();
        }
      } else {
        throw new Error(result.message || 'Error desconocido en la creación del ticket');
      }
    } catch (error) {
      console.error('Error purchasing seats:', error);
      alert(`Error en la compra: ${error.message}. Se revertirán los cambios.`);

      if (!ticketCreated && reservedSeats.length > 0) {
        try {
          const rollbackPromises = reservedSeats.map(seatId =>
            updateSeatStatus(seatId, 'AVAILABLE').catch(err =>
              console.error(`Error reverting seat ${seatId}:`, err)
            )
          );
          await Promise.allSettled(rollbackPromises);
          console.log('Rollback completed for reserved seats');
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
          alert('Error adicional durante la reversión. Contacta soporte.');
        }
      }

      if (selectedSection) {
        await loadSeatsForSection(selectedSection.sectionID);
      }
    } finally {
      setReservingSeats(false);
    }
  };

  const handleShowMap = async () => {
    setShowMapModal(true);
    setModalLoading(true);
    setModalError(null);
    setLoadingLayout(true);
    try {
      const loadedSeats = await loadSectionsAndSeats();
      await loadEventLayout(loadedSeats);
      if (selectedSection && layoutElements.some(el => el.type === 'seatRow')) {
        await generateSeatsFromLayout(layoutElements);
        await loadSeatsForSection(selectedSection.sectionID);
      }

    } catch (error) {
      console.error('Error loading map:', error);
      setModalError('Error al cargar el mapa del evento. Inténtalo de nuevo.');
      setLayoutElements([]);
      setLayoutId(null);
    } finally {
      setLoadingLayout(false);
      setModalLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (selectedSeatCount === 0) return;

    const timeout = setTimeout(() => {
      setSelectedSeats([]);
      alert('Tu selección de asientos ha expirado por inactividad. Por favor, selecciona nuevamente.');
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [selectedSeatCount]);

  useEffect(() => {
    if (!showMapModal) {
      setSelectedSeats([]);
    }
  }, [showMapModal]);

  useEffect(() => {
    if (selectedSection) {
      loadSeatsForSection(selectedSection.sectionID);
    }
  }, [selectedSection]);

  useEffect(() => {
    setLayoutElements(prev => prev.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        const updatedPositions = element.seatPositions.map(pos => {
          const isSelected = selectedSeats.includes(pos.id);
          return { ...pos, status: isSelected ? 'SELECTED' : (pos.status === 'SELECTED' ? 'AVAILABLE' : pos.status) };
        });
        return { ...element, seatPositions: updatedPositions };
      }
      return element;
    }));
  }, [selectedSeats]);

  return {
    // Constants
    MAX_SEATS_PER_PURCHASE,
    DEFAULT_SEAT_PRICE,

    // State
    layoutElements,
    layoutId,
    loadingLayout,
    selectedSeats,
    reservingSeats,
    sections,
    seats,
    selectedSection,
    showPurchaseModal,
    zoom,
    offset,
    modalError,
    modalLoading,
    lastUpdate,
    showMapModal,
    selectedSeatDetails,
    selectedSeatCount,
    totalPrice,

    // Setters
    setSelectedSection,
    setShowPurchaseModal,
    setZoom,
    setOffset,
    setShowMapModal,
    setLastUpdate,
    setModalLoading,

    // Methods
    loadSections,
    loadSeatsForSection,
    handleSeatSelect,
    handleSeatPositionSelect,
    handlePurchaseSeats,
    handleShowMap,
    loadEventLayout
  };
};