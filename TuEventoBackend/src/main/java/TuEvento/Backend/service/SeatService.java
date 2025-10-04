package TuEvento.Backend.service;

import TuEvento.Backend.dto.SeatDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface SeatService {
    ResponseDto<SeatDto> insertSeat(SeatDto seatDto);
    ResponseDto<String> updateSeat(int seatID, SeatDto seatDto);
    ResponseDto<String> deleteSeat(int seatID);
    ResponseDto<List<SeatDto>> getAllSeats();
    ResponseDto<SeatDto> getSeatById(int seatID);
    ResponseDto<String> updateSeatStatus(int seatID, boolean newStatus);
    ResponseDto<List<SeatDto>> getSeatsBySection(int sectionId);
    ResponseDto<String> deleteSeatsBySection(int sectionId);
    ResponseDto<String> releaseExpiredReservations();
}
