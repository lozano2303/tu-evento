package TuEvento.Backend.controller;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/login")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping
    public ResponseDto<String> login(@RequestBody LoginDto loginDto) {
        return loginService.login(loginDto);
    }

    @PostMapping("/register")
    public ResponseDto<String> registerLogin(@RequestBody RequestLoginDTO requestLoginDTO) {
        return loginService.save(requestLoginDTO);
    }
}