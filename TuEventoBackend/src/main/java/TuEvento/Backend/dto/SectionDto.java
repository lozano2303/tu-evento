package TuEvento.Backend.dto;

import java.math.BigDecimal;

public class SectionDto {
    private int sectionID;
    private String sectionName;
    private BigDecimal price;
    public SectionDto(){}
    public SectionDto(int sectionID, String sectionName, BigDecimal price) {
        this.sectionID = sectionID;
        this.sectionName = sectionName;
        this.price = price;
    }
    public int getSectionID() {
        return sectionID;
    }
    public void setSectionID(int sectionID) {
        this.sectionID = sectionID;
    }
    public String getSectionName() {
        return sectionName;
    }
    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }
    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
