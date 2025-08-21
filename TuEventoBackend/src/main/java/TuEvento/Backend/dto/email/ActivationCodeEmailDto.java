package TuEvento.Backend.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivationCodeEmailDto {
    private String to;             // Recipient's email address
    private String activationCode; // Activation code to send
    private String userFullName;   // Name to personalize the email
}