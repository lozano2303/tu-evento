package TuEvento.Backend.dto;

public class SectionNameDto {

    @com.fasterxml.jackson.annotation.JsonProperty("sectionNameID")
    private Integer sectionNameID;
    private String name;

    public SectionNameDto() {
    }

    public SectionNameDto(Integer sectionNameID, String name) {
        this.sectionNameID = sectionNameID;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSectionNameID() {
        return sectionNameID;
    }

    public void setSectionNameID(Integer sectionNameID) {
        this.sectionNameID = sectionNameID;
    }

}