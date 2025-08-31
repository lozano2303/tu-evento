package TuEvento.Backend.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResponseLogin {
    private String token;
    private Integer userID;
    private String role;
}