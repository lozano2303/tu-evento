package TuEvento.Backend.controller;

import TuEvento.Backend.dto.AccountActivationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.AccountActivationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account-activation")
public class AccountActivationController {

    @Autowired
    private AccountActivationService activationService;

    /**
     * Endpoint to create an activation code for a user and send it by email.
     */
    @PostMapping("/create")
    public ResponseEntity<String> createActivationCode(@RequestBody AccountActivationDto dto) {
        try {
            activationService.createActivationForUser(dto.getUserID());
            return ResponseEntity.ok("Activation code generated and sent to the user's email.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }

    /**
     * Endpoint to resend a new activation code for a user.
     */
    @PutMapping("/resend")
    public ResponseEntity<String> resendActivationCode(@RequestBody AccountActivationDto dto) {
        try {
            activationService.resendActivationCode(dto.getUserID());
            return ResponseEntity.ok("A new activation code was generated and sent to the user's email.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
    }

    /**
     * Endpoint to verify the activation code for a user.
     */
    @PutMapping("/verify")
    public ResponseEntity<ResponseDto<String>> verifyActivationCode(@RequestBody AccountActivationDto dto) {
        try {
            ResponseDto<String> response = activationService.verifyActivationCode(dto.getUserID(), dto.getActivationCode());
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
