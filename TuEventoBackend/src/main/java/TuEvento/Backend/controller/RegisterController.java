package TuEvento.Backend.controller;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/register")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping
    public ResponseDto<String> register(@RequestBody RegisterRequestDto registerRequestDto) {
        return registerService.register(registerRequestDto);
    }
}