package TuEvento.Backend.dto;

public class CategoryDto {

    @com.fasterxml.jackson.annotation.JsonProperty("categoryID")
    private Integer categoryID;
    private String name;
    private String description;
    private Integer dadID;

    public CategoryDto() {
    }

    public CategoryDto(Integer categoryID, String name, String description, Integer dadID) {
        this.categoryID = categoryID;
        this.name = name;
        this.description = description;
        this.dadID = dadID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDadID() {
        return dadID;
    }

    public void setDadID(Integer dadID) {
        this.dadID = dadID;
    }

    public Integer getCategoryID() {
        return categoryID;
    }

    public void setCategoryID(Integer categoryID) {
        this.categoryID = categoryID;
    }

    public Integer getId() {
        return categoryID;
    }

    public void setId(Integer id) {
        this.categoryID = id;
    }
}