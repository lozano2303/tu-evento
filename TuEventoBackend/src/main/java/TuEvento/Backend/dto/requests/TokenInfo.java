package TuEvento.Backend.dto.requests;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor
public class TokenInfo {
    private String email;
    private LocalDateTime expiry;
}
