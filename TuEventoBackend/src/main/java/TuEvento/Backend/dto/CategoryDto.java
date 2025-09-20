package TuEvento.Backend.dto;

public class CategoryDto {

    private String name;
    private String description;
    private Integer dadID;

    public CategoryDto() {
    }

    public CategoryDto(String name, String description, Integer dadID) {
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
}