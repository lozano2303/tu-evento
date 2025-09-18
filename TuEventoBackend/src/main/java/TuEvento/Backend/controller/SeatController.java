package TuEvento.Backend.controller;

import TuEvento.Backend.dto.SeatDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    // Crear asiento
    @PostMapping
    public ResponseEntity<ResponseDto<SeatDto>> insertSeat(@RequestBody SeatDto seatDto) {
        ResponseDto<SeatDto> response = seatService.insertSeat(seatDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    // Actualizar asiento
    @PutMapping("/{seatID}")
    public ResponseEntity<ResponseDto<String>> updateSeat(@PathVariable int seatID, @RequestBody SeatDto seatDto) {
        ResponseDto<String> response = seatService.updateSeat(seatID, seatDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Actualizar solo el estado del asiento (ocupado/disponible)
    @PutMapping("/{seatID}/status")
    public ResponseEntity<ResponseDto<String>> updateSeatStatus(
            @PathVariable int seatID,
            @RequestParam boolean newStatus) {
        
        ResponseDto<String> response = seatService.updateSeatStatus(seatID, newStatus);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Eliminar asiento
    @DeleteMapping("/{seatID}")
    public ResponseEntity<ResponseDto<String>> deleteSeat(@PathVariable int seatID) {
        ResponseDto<String> response = seatService.deleteSeat(seatID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Obtener todos los asientos
    @GetMapping
    public ResponseEntity<ResponseDto<List<SeatDto>>> getAllSeats() {
        ResponseDto<List<SeatDto>> response = seatService.getAllSeats();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // Obtener asiento por ID
    @GetMapping("/{seatID}")
    public ResponseEntity<ResponseDto<SeatDto>> getSeatById(@PathVariable int seatID) {
        ResponseDto<SeatDto> response = seatService.getSeatById(seatID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}