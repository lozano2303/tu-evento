package TuEvento.Backend.model;


import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Entity(name = "section")
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sectionID", nullable = false)
    private int sectionID;

    @ManyToOne
    @JoinColumn(name="eventID", nullable = false)
    private Event eventID;

    @Column(name = "sectionName", nullable = false, length = 50)
    private String sectionName;
    @Column(name="price", nullable = false, precision = 10, scale = 3)
    private BigDecimal price;
    public Section(){}
    public Section(int sectionID, String sectionName, BigDecimal price) {
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
    public Event getEventID() {
        return eventID;
    }
    public void setEventID(Event eventID) {
        this.eventID = eventID;
    }

}
