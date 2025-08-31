package TuEvento.Backend.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivationCodeEmailDto {
    private String to;
    private String activationCode;
    private String userFullName;
}