package TuEvento.Backend.controller;

import TuEvento.Backend.service.AccountActivationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account-activation")
public class AccountActivationController {

    @Autowired
    private AccountActivationService activationService;

    /**
     * Endpoint to verify the activation code for a user.
     */
    @PutMapping("/verify")
    public String verifyActivationCode(@RequestParam int userId, @RequestParam String code) {
        boolean activated = activationService.verifyActivationCode(userId, code);
        if (activated) {
            return "Account activated successfully.";
        } else {
            return "Invalid or expired activation code.";
        }
    }
}