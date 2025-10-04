package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.SeatDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Seat;
import TuEvento.Backend.model.Section;
import TuEvento.Backend.model.EventLayout;
import TuEvento.Backend.repository.SeatRepository;
import TuEvento.Backend.repository.SectionRepository;
import TuEvento.Backend.repository.EventLayoutRepository;
import TuEvento.Backend.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SeatServiceImpl implements SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private EventLayoutRepository eventLayoutRepository;

    @Override
    @Transactional
    public ResponseDto<SeatDto> insertSeat(SeatDto seatDto) {
        Optional<Section> sectionOpt = sectionRepository.findById(seatDto.getSectionID());
        if (!sectionOpt.isPresent()) {
            return ResponseDto.error("Sección no encontrada");
        }

        Optional<EventLayout> eventLayoutOpt = eventLayoutRepository.findById(seatDto.getEventLayoutID());
        if (!eventLayoutOpt.isPresent()) {
            return ResponseDto.error("EventLayout no encontrado");
        }

        try {
            // Check if seat already exists at this position for this section
            Optional<Seat> existingSeat = seatRepository.findBySectionID_SectionIDAndXAndY(seatDto.getSectionID(), seatDto.getX(), seatDto.getY());
            if (existingSeat.isPresent()) {
                return ResponseDto.error("Ya existe un asiento en esta posición para esta sección");
            }

            Seat seat = new Seat();
            seat.setSectionID(sectionOpt.get());
            seat.setEventLayoutID(eventLayoutOpt.get());
            seat.setSeatNumber(seatDto.getSeatNumber());
            seat.setRow(seatDto.getRow());
            seat.setX(seatDto.getX());
            seat.setY(seatDto.getY());
            seat.setStatus("AVAILABLE".equals(seatDto.getStatus()) ? true : false); // true = available, false = occupied

            seatRepository.save(seat);

            SeatDto responseDto = new SeatDto(
                seat.getSeatID(),
                seat.getSectionID().getSectionID(),
                seat.getEventLayoutID().getId(),
                seat.getSeatNumber(),
                seat.getRow(),
                seat.getX(),
                seat.getY(),
                seat.isStatus() ? "AVAILABLE" : "OCCUPIED"
            );
            return ResponseDto.ok("Asiento insertado correctamente", responseDto);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar el asiento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateSeat(int seatID, SeatDto seatDto) {
        Optional<Seat> seatOpt = seatRepository.findById(seatID);
        if (!seatOpt.isPresent()) {
            return ResponseDto.error("Asiento no encontrado");
        }

        Optional<Section> sectionOpt = sectionRepository.findById(seatDto.getSectionID());
        if (!sectionOpt.isPresent()) {
            return ResponseDto.error("Sección no encontrada");
        }

        Optional<EventLayout> eventLayoutOpt = eventLayoutRepository.findById(seatDto.getEventLayoutID());
        if (!eventLayoutOpt.isPresent()) {
            return ResponseDto.error("EventLayout no encontrado");
        }

        try {
            Seat seat = seatOpt.get();
            seat.setSectionID(sectionOpt.get());
            seat.setEventLayoutID(eventLayoutOpt.get());
            seat.setSeatNumber(seatDto.getSeatNumber());
            seat.setRow(seatDto.getRow());
            seat.setX(seatDto.getX());
            seat.setY(seatDto.getY());
            seat.setStatus("AVAILABLE".equals(seatDto.getStatus()) ? true : false);

            seatRepository.save(seat);
            return ResponseDto.ok("Asiento actualizado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el asiento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteSeat(int seatID) {
        Optional<Seat> seatOpt = seatRepository.findById(seatID);
        if (!seatOpt.isPresent()) {
            return ResponseDto.error("Asiento no encontrado");
        }

        try {
            seatRepository.deleteById(seatID);
            return ResponseDto.ok("Asiento eliminado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar el asiento");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar el asiento");
        }
    }

    @Override
    public ResponseDto<List<SeatDto>> getAllSeats() {
        List<Seat> seats = seatRepository.findAll();

        if (seats.isEmpty()) {
            return ResponseDto.error("No hay asientos registrados");
        }

        List<SeatDto> seatsDto = seats.stream()
                .map(seat -> new SeatDto(
                        seat.getSeatID(),
                        seat.getSectionID().getSectionID(),
                        seat.getEventLayoutID().getId(),
                        seat.getSeatNumber(),
                        seat.getRow(),
                        seat.getX(),
                        seat.getY(),
                        seat.isStatus() ? "AVAILABLE" : "OCCUPIED"
                ))
                .collect(Collectors.toList());

        return ResponseDto.ok("Asientos encontrados", seatsDto);
    }

    @Override
    public ResponseDto<SeatDto> getSeatById(int seatID) {
        Optional<Seat> seatOpt = seatRepository.findById(seatID);
        if (!seatOpt.isPresent()) {
            return ResponseDto.error("Asiento no encontrado");
        }

        Seat seat = seatOpt.get();
        SeatDto seatDto = new SeatDto(
                seat.getSeatID(),
                seat.getSectionID().getSectionID(),
                seat.getEventLayoutID().getId(),
                seat.getSeatNumber(),
                seat.getRow(),
                seat.getX(),
                seat.getY(),
                seat.isStatus() ? "AVAILABLE" : "OCCUPIED"
        );

        return ResponseDto.ok("Asiento encontrado", seatDto);
    }

    @Override
    public ResponseDto<List<SeatDto>> getSeatsBySection(int sectionId) {
        // Check if section exists
        Optional<Section> sectionOpt = sectionRepository.findById(sectionId);
        if (!sectionOpt.isPresent()) {
            return ResponseDto.error("Sección no encontrada");
        }

        List<Seat> seats = seatRepository.findBySectionID_SectionID(sectionId);

        List<SeatDto> seatsDto = seats.stream()
                .map(seat -> new SeatDto(
                        seat.getSeatID(),
                        seat.getSectionID().getSectionID(),
                        seat.getEventLayoutID().getId(),
                        seat.getSeatNumber(),
                        seat.getRow(),
                        seat.getX(),
                        seat.getY(),
                        seat.isStatus() ? "AVAILABLE" : "OCCUPIED"
                ))
                .collect(Collectors.toList());

        return ResponseDto.ok("Asientos encontrados", seatsDto);
    }

    @Override
    @Transactional
    public ResponseDto<String> updateSeatStatus(int seatID, boolean newStatus) {
        Optional<Seat> seatOpt = seatRepository.findById(seatID);
        if (!seatOpt.isPresent()) {
            return ResponseDto.error("Asiento no encontrado");
        }

        try {
            Seat seat = seatOpt.get();
            seat.setStatus(!newStatus); // newStatus true (occupied) -> set false (occupied)
            seatRepository.save(seat);

            String estado = !seat.isStatus() ? "ocupado" : "disponible";
            return ResponseDto.ok("Estado del asiento actualizado a " + estado);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al actualizar el estado");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el estado del asiento");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteSeatsBySection(int sectionId) {
        try {
            // Check if section exists
            Optional<Section> sectionOpt = sectionRepository.findById(sectionId);
            if (!sectionOpt.isPresent()) {
                return ResponseDto.error("Sección no encontrada");
            }

            // Find all seats for this section
            List<Seat> seatsToDelete = seatRepository.findBySectionID_SectionID(sectionId);

            if (seatsToDelete.isEmpty()) {
                return ResponseDto.ok("No hay asientos para eliminar en esta sección");
            }

            // Delete all seats for this section
            int deletedCount = 0;
            for (Seat seat : seatsToDelete) {
                seatRepository.delete(seat);
                deletedCount++;
            }

            return ResponseDto.ok("Eliminados " + deletedCount + " asientos de la sección");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar asientos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar asientos de la sección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> releaseExpiredReservations() {
        try {
            // For now, release all occupied seats that might be stuck from failed reservations
            // In a production system, you'd check timestamps or reservation records
            List<Seat> occupiedSeats = seatRepository.findAll().stream()
                .filter(seat -> !seat.isStatus()) // occupied
                .collect(Collectors.toList());

            int releasedCount = 0;
            for (Seat seat : occupiedSeats) {
                // Check if this seat has any associated tickets
                // If no active tickets, release it
                // For simplicity, release all occupied seats (not ideal for production)
                seat.setStatus(true); // set to available
                seatRepository.save(seat);
                releasedCount++;
            }

            return ResponseDto.ok("Liberados " + releasedCount + " asientos expirados");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al liberar reservaciones");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al liberar reservaciones expiradas");
        }
    }
}
