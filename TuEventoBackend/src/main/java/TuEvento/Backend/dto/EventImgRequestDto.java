package TuEvento.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventImgRequestDto {
    private int eventId;
    private MultipartFile file;
    private int order;
}