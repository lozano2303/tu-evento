package TuEvento.Backend.model;

import jakarta.persistence.*;

@Entity(name = "category_event")
public class CategoryEvent {

    @EmbeddedId
    private CategoryEventId id;

    @ManyToOne
    @MapsId("categoryID")
    @JoinColumn(name = "categoryID")
    private Category category;

    @ManyToOne
    @MapsId("eventID")
    @JoinColumn(name = "eventID")
    private Event event;

    public CategoryEvent() {}

    public CategoryEvent(Category category, Event event) {
        this.category = category;
        this.event = event;
        this.id = new CategoryEventId(category.getCategoryID(), event.getId());
    }

    public CategoryEventId getId() {
        return id;
    }

    public void setId(CategoryEventId id) {
        this.id = id;
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