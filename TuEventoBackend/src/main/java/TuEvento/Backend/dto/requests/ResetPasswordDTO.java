package TuEvento.Backend.dto.requests;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordDTO {
    private String token;
    private String newPassword;
}
