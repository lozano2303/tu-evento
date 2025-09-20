package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name = "category_event")
@IdClass(CategoryEventId.class)
public class CategoryEvent {

    @Id
    @ManyToOne
    @JoinColumn(name = "categoryID", referencedColumnName = "categoryID")
    private Category category;

    @Id
    @ManyToOne
    @JoinColumn(name = "eventID", referencedColumnName = "eventID")
    private Event event;

    public CategoryEvent() {}

    public CategoryEvent(Category category, Event event) {
        this.category = category;
        this.event = event;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }
}