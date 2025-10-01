package TuEvento.Backend.controller;

import TuEvento.Backend.dto.AddressDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    // Crear dirección
    @PostMapping
    public ResponseEntity<ResponseDto<Integer>> insertAddress(@RequestBody AddressDto addressDto) {
        ResponseDto<Integer> response = addressService.insertAddress(addressDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    // Actualizar dirección
    @PutMapping("/{addressID}")
    public ResponseEntity<ResponseDto<String>> updateAddress(@PathVariable int addressID, @RequestBody AddressDto addressDto) {
        ResponseDto<String> response = addressService.updateAddress(addressID, addressDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Eliminar dirección
    @DeleteMapping("/{addressID}")
    public ResponseEntity<ResponseDto<String>> deleteAddress(@PathVariable int addressID) {
        ResponseDto<String> response = addressService.deleteAddress(addressID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // Obtener todas las direcciones
    @GetMapping
    public ResponseEntity<ResponseDto<List<AddressDto>>> getAllAddresses() {
        ResponseDto<List<AddressDto>> response = addressService.getAllAddresses();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // Obtener dirección por ID
    @GetMapping("/{addressID}")
    public ResponseEntity<ResponseDto<AddressDto>> getAddressById(@PathVariable int addressID) {
        ResponseDto<AddressDto> response = addressService.getAddressById(addressID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
