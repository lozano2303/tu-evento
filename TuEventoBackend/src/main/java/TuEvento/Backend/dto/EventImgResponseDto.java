package TuEvento.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventImgResponseDto {
    private int eventImgID;
    private String url;
    private int order;
}