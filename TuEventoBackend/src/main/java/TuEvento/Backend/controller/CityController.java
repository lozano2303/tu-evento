package TuEvento.Backend.controller;

import TuEvento.Backend.dto.CityDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.CityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
public class CityController {

    @Autowired
    private CityService cityService;

    // Crear ciudad
    @PostMapping
    public ResponseEntity<ResponseDto<CityDto>> insertCity(@RequestBody CityDto cityDto) {
        ResponseDto<CityDto> response = cityService.insertCity(cityDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    // Actualizar ciudad
    @PutMapping("/{cityID}")
    public ResponseEntity<ResponseDto<String>> updateCity(@PathVariable int cityID, @RequestBody CityDto cityDto) {
        ResponseDto<String> response = cityService.updateCity(cityID, cityDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Eliminar ciudad
    @DeleteMapping("/{cityID}")
    public ResponseEntity<ResponseDto<String>> deleteCity(@PathVariable int cityID) {
        ResponseDto<String> response = cityService.deleteCity(cityID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Obtener todas las ciudades
    @GetMapping
    public ResponseEntity<ResponseDto<List<CityDto>>> getAllCities() {
        ResponseDto<List<CityDto>> response = cityService.getAllCities();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // Obtener ciudad por ID
    @GetMapping("/{cityID}")
    public ResponseEntity<ResponseDto<CityDto>> getCityById(@PathVariable int cityID) {
        ResponseDto<CityDto> response = cityService.getCityById(cityID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
