package TuEvento.Backend.controller;

import TuEvento.Backend.dto.AccountActivationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.AccountActivationService;
import org.springframework.beans.factory.annotation.Autowired;
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
    public String createActivationCode(@RequestBody AccountActivationDto dto) {
        activationService.createActivationForUser(dto.getUserID());
        return "Activation code generated and sent to the user's email.";
    }

    /**
     * Endpoint to verify the activation code for a user.
     */
    @PutMapping("/verify")
    public ResponseDto<String> verifyActivationCode(@RequestBody AccountActivationDto dto) {
        return activationService.verifyActivationCode(dto.getUserID(), dto.getActivationCode());
    }
}