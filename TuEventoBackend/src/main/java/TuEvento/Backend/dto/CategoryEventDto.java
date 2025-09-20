package TuEvento.Backend.dto;

public class CategoryEventDto {

    private Integer categoryID;
    private Integer eventID;

    public CategoryEventDto() {
    }

    public CategoryEventDto(Integer categoryID, Integer eventID) {
        this.categoryID = categoryID;
        this.eventID = eventID;
    }

    public Integer getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(Integer categoryID) {
        this.categoryID = categoryID;
    }

    public Integer getEventID() {
        return eventID;
    }

    public void setEventID(Integer eventID) {
        this.eventID = eventID;
    }
}