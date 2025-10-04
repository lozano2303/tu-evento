package TuEvento.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity(name = "section_name")
public class SectionName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sectionNameID", nullable = false)
    private Integer sectionNameID;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    public SectionName() {}

    public SectionName(Integer sectionNameID, String name) {
        this.sectionNameID = sectionNameID;
        this.name = name;
    }

    public Integer getSectionNameID() {
        return sectionNameID;
    }

    public void setSectionNameID(Integer sectionNameID) {
        this.sectionNameID = sectionNameID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}