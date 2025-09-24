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
            Seat seat = new Seat();
            seat.setSectionID(sectionOpt.get());
            seat.setEventLayoutID(eventLayoutOpt.get());
            seat.setSeatNumber(seatDto.getSeatNumber());
            seat.setRow(seatDto.getRow());
            seat.setX(seatDto.getX());
            seat.setY(seatDto.getY());
            seat.setStatus("AVAILABLE".equals(seatDto.getStatus()) ? false : true); // Convert string to boolean

            seatRepository.save(seat);

            SeatDto responseDto = new SeatDto(
                seat.getSectionID().getSectionID(),
                seat.getEventLayoutID().getId(),
                seat.getSeatNumber(),
                seat.getRow(),
                seat.getX(),
                seat.getY(),
                seat.isStatus() ? "OCCUPIED" : "AVAILABLE"
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
            seat.setStatus("AVAILABLE".equals(seatDto.getStatus()) ? false : true);

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
                        seat.getSectionID().getSectionID(),
                        seat.getEventLayoutID().getId(),
                        seat.getSeatNumber(),
                        seat.getRow(),
                        seat.getX(),
                        seat.getY(),
                        seat.isStatus() ? "OCCUPIED" : "AVAILABLE"
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
                seat.getSectionID().getSectionID(),
                seat.getEventLayoutID().getId(),
                seat.getSeatNumber(),
                seat.getRow(),
                seat.getX(),
                seat.getY(),
                seat.isStatus() ? "OCCUPIED" : "AVAILABLE"
        );

        return ResponseDto.ok("Asiento encontrado", seatDto);
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
            seat.setStatus(newStatus);
            seatRepository.save(seat);

            String estado = newStatus ? "ocupado" : "disponible";
            return ResponseDto.ok("Estado del asiento actualizado a " + estado);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al actualizar el estado");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el estado del asiento");
        }
    }
}
