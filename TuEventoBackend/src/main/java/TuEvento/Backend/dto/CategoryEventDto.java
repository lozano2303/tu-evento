package TuEvento.Backend.dto;

public class CategoryEventDto {

    private int categoryID;
    private int eventID;

    public CategoryEventDto() {
    }

    public CategoryEventDto(Integer categoryID, Integer eventID) {
        this.categoryID = categoryID;
        this.eventID = eventID;
    }

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
}