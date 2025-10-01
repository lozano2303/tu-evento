package TuEvento.Backend.model;

import java.io.Serializable;
import java.util.Objects;

public class CategoryEventId implements Serializable {
    private int categoryID;
    private int eventID;

    public CategoryEventId() {}

    public CategoryEventId(int categoryID, int eventID) {
        this.categoryID = categoryID;
        this.eventID = eventID;
    }

    // Getters and setters
    public int getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(int categoryID) {
        this.categoryID = categoryID;
    }

    public int getEventID() {
        return eventID;
    }

    public void setEventID(int eventID) {
        this.eventID = eventID;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CategoryEventId)) return false;
        CategoryEventId that = (CategoryEventId) o;
        return categoryID == that.categoryID && eventID == that.eventID;
    }

    @Override
    public int hashCode() {
        return Objects.hash(categoryID, eventID);
    }
}