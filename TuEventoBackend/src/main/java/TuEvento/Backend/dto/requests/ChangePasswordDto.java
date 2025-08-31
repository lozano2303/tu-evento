package TuEvento.Backend.dto.requests;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO para el cambio de contraseña.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {
    private String oldPassword;
    private String newPassword;
}