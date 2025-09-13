package TuEvento.Backend.dto.responses;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResponseEventSearch {
    private String eventName;
    private LocalDate startDate;
    private LocalDate finishDate;
    private int status;
}
