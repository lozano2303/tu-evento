package TuEvento.Backend.controller;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/register")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping
    public ResponseEntity<ResponseDto<String>> register(@RequestBody RegisterRequestDto registerRequestDto) {
        try {
            ResponseDto<String> response = registerService.register(registerRequestDto);
            if (!response.isSuccess()) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDto.error("Error interno del servidor"));
        }
    }
}