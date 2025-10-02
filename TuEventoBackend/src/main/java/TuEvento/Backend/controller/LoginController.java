package TuEvento.Backend.controller;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.requests.ChangePasswordDto;
import TuEvento.Backend.dto.requests.ForgotPasswordDto;

import TuEvento.Backend.dto.requests.ResetPasswordDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseLogin; // Import añadido
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.impl.LoginServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/v1/login")
public class LoginController {

    @Autowired
    private LoginService loginService;
    @Autowired
    private LoginServiceImpl loginServiceImpl;

    @PostMapping("/start")
    public ResponseEntity<ResponseDto<ResponseLogin>> login(@RequestBody LoginDto loginDto) {
        ResponseDto<ResponseLogin> response = loginService.login(loginDto);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/changePassword")
    public ResponseEntity<ResponseDto> changePassword(@RequestBody ChangePasswordDto dto) {
        // Esto lo pongo para tener el nombre del usuario XD
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Correo de usuario: " + email);
        ResponseDto response = loginServiceImpl.changePassword(email, dto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
    @PostMapping("/forgot")
    public ResponseEntity<Object> forgotPassword(@RequestBody ForgotPasswordDto dto) {
        ResponseDto response = loginServiceImpl.forgotPassword(dto.getEmail());
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
    /**
     * Endpoint para validar el token de reseteo de contraseña.
     */
    @GetMapping("/validateResetToken")
    public ResponseEntity<ResponseDto<String>> validateResetToken(@RequestParam String token) {
        ResponseDto<String> response = loginServiceImpl.validateResetToken(token);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    /**
     * Endpoint para cambiar la contraseña usando un token válido.
     */
    @PostMapping("/resetPasswordWithToken")
    public ResponseEntity<ResponseDto<String>> resetPasswordWithToken(@RequestBody ResetPasswordDTO dto) {
        ResponseDto<String> response = loginServiceImpl.resetPasswordWithToken(dto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
}