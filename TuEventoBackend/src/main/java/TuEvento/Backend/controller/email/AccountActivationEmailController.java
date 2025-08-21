package TuEvento.Backend.controller.email;

import TuEvento.Backend.model.User;
import TuEvento.Backend.service.AccountActivationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activation/email")
public class AccountActivationEmailController {

    @Autowired
    private AccountActivationService accountActivationService;

    /**
     * Endpoint to trigger sending the activation code email for a user.
     * Example usage: POST /api/activation/email/send/{userId}
     */
    @PostMapping("/send/{userId}")
    public ResponseEntity<?> sendActivationCodeEmail(@PathVariable int userId) {
        // If your service does not have getUserById, use repository or create a method.
        User user = accountActivationService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        accountActivationService.createActivationForUser(user);
        return ResponseEntity.ok("Activation email sent");
    }
}