package TuEvento.Backend.controller;

import TuEvento.Backend.dto.StatusNameDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.StatusNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/statusName")
public class StatusNameController {

    @Autowired
    private StatusNameService statusNameService;

    // Crear statusName
    @PostMapping
    public ResponseEntity<ResponseDto<StatusNameDto>> insertStatusName(@RequestBody StatusNameDto statusNameDto) {
        ResponseDto<StatusNameDto> response = statusNameService.insertStatusName(statusNameDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }
    // Eliminar statusName
    @DeleteMapping("/{statusNameID}")
    public ResponseEntity<ResponseDto<String>> deleteStatusName(@PathVariable int statusNameID) {
        ResponseDto<String> response = statusNameService.deleteStatusName(statusNameID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Obtener todos los statusName
    @GetMapping
    public ResponseEntity<ResponseDto<List<StatusNameDto>>> getAllStatusName() {
        ResponseDto<List<StatusNameDto>> response = statusNameService.getAllStatusName();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
    

    
    // Actualizar statusName
    @PutMapping("/{statusNameID}")
    public ResponseEntity<ResponseDto<String>> updateStatusName(@PathVariable int statusNameID, @RequestBody StatusNameDto statusNameDto) {
        ResponseDto<String> response = statusNameService.updateStatusName(statusNameID, statusNameDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Obtener statusName por ID
    @GetMapping("/{statusNameID}")
    public ResponseEntity<ResponseDto<StatusNameDto>> getStatusNameById(@PathVariable int statusNameID) {
        ResponseDto<StatusNameDto> response = statusNameService.getStatusNameById(statusNameID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
