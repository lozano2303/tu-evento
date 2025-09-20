package TuEvento.Backend.model;

import java.io.Serializable;
import java.util.Objects;

public class CategoryEventId implements Serializable {
    private int category;
    private int event;

    public CategoryEventId() {}

    public CategoryEventId(int category, int event) {
        this.category = category;
        this.event = event;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CategoryEventId)) return false;
        CategoryEventId that = (CategoryEventId) o;
        return category == that.category && event == that.event;
    }

    @Override
    public int hashCode() {
        return Objects.hash(category, event);
    }
}