package TuEvento.Backend.dto.requests;
import TuEvento.Backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RequestLoginDTO {
    private String username;
    private String password;
    private String email;
    private User userID;
}
