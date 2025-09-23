package TuEvento.Backend.dto.requests;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenInfo {
    private int idRecoverPassword;
    private String token;
}
