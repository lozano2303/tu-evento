package TuEvento.Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event_img")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int eventImgID;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "img_order")
    private int order;
}