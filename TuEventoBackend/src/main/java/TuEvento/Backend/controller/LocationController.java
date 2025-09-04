package TuEvento.Backend.controller;

import TuEvento.Backend.dto.LocationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping
    public ResponseEntity<ResponseDto<LocationDto>> insertLocation(@RequestBody LocationDto locationDto) {
        ResponseDto<LocationDto> response = locationService.insertLocation(locationDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @PutMapping("/{locationID}")
    public ResponseEntity<ResponseDto<String>> updateLocation(@PathVariable int locationID, @RequestBody LocationDto locationDto) {
        ResponseDto<String> response = locationService.updateLocation(locationID, locationDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/{locationID}")
    public ResponseEntity<ResponseDto<String>> deleteLocation(@PathVariable int locationID) {
        ResponseDto<String> response = locationService.deleteLocation(locationID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<LocationDto>>> getAllLocations() {
        ResponseDto<List<LocationDto>> response = locationService.getAllLocations();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/{locationID}")
    public ResponseEntity<ResponseDto<LocationDto>> getLocationById(@PathVariable int locationID) {
        ResponseDto<LocationDto> response = locationService.getLocationById(locationID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
