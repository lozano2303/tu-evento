package TuEvento.Backend.dto;

import java.math.BigDecimal;

public class SectionDto {
    private int sectionID;
    private int eventId;
    private String sectionName;
    private double price;
    public SectionDto(){}
    public SectionDto(int sectionID, int eventId, String sectionName, double price) {
        this.sectionID = sectionID;
        this.eventId = eventId;
        this.sectionName = sectionName;
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
    public String getSectionName() {
        return sectionName;
    }
    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }
    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }
}
