package TuEvento.Backend.controller;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.requests.ChangePasswordDto;
import TuEvento.Backend.dto.requests.ForgotPasswordDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.requests.ResetPasswordDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseLogin; // Import añadido
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.impl.LoginServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import TuEvento.Backend.dto.UserDto;

@RestController
@RequestMapping("/api/v1/login")
public class LoginController {

    @Autowired
    private LoginService loginService;
    @Autowired
    private LoginServiceImpl loginServiceImpl;

    @PostMapping("/start")
    public ResponseDto<ResponseLogin> login(@RequestBody LoginDto loginDto) { // Cambiado a ResponseLogin
        return loginService.login(loginDto);
    }

    @PostMapping("/register")
    public ResponseDto<String> registerLogin(@RequestBody RequestLoginDTO requestLoginDTO) {
        return loginService.save(requestLoginDTO);
    }
    
    @PostMapping("/changePassword")
    public ResponseEntity<ResponseDto> changePassword(@RequestBody ChangePasswordDto dto) {
        // Esto lo pongo para tener el nombre del usuario XD
        String email = SecurityContextHolder.getContext().getAuthentication().getName(); 
        System.out.println("Correo de usuario: " + email);
        ResponseDto response = loginServiceImpl.changePassword(email, dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @PostMapping("/forgot")
    public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordDto dto) {
        ResponseDto response = loginServiceImpl.forgotPassword(dto.getEmail());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @PostMapping("/resetPassword")
    public ResponseEntity<Object> resetPassword(@RequestBody ResetPasswordDTO dto) {
        ResponseDto response = loginServiceImpl.resetPassword(dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}