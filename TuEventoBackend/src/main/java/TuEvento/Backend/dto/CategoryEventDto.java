package TuEvento.Backend.dto;

public class CategoryEventDto {

    private int categoryID;
    private int eventID;
    private String name;
    private String parentName;

    public CategoryEventDto() {
    }

    public CategoryEventDto(Integer categoryID, Integer eventID, String name, String parentName) {
        this.categoryID = categoryID;
        this.eventID = eventID;
        this.name = name;
        this.parentName = parentName;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }
}