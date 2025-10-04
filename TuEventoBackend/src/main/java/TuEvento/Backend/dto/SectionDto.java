package TuEvento.Backend.dto;

import java.math.BigDecimal;

public class SectionDto {
    private int sectionID;
    private int eventId;
    private Integer sectionNameID;
    private double price;
    public SectionDto(){}
    public SectionDto(int sectionID, int eventId, Integer sectionNameID, double price) {
        this.sectionID = sectionID;
        this.eventId = eventId;
        this.sectionNameID = sectionNameID;
        this.price = price;
    }
    public int getSectionID() {
        return sectionID;
    }
    public void setSectionID(int sectionID) {
        this.sectionID = sectionID;
    }
    public int getEventId() {
        return eventId;
    }
    public void setEventId(int eventId) {
        this.eventId = eventId;
    }
    public Integer getSectionNameID() {
        return sectionNameID;
    }
    public void setSectionNameID(Integer sectionNameID) {
        this.sectionNameID = sectionNameID;
    }
    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }
}
