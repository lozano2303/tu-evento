package TuEvento.Backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "organizer_petition")
public class OrganizerPetition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int organizerPetitionID;

    @OneToOne
    @JoinColumn(name = "userid", referencedColumnName = "userID", nullable = false)
    private User userID;

    @Column(name = "document", nullable = false)
    private byte[] document;

    @Column(name = "applicationDate", nullable = false)
    private LocalDateTime applicationDate;

    @Column(name = "status", nullable = false)
    private int status;

    public OrganizerPetition() {
    }

    public OrganizerPetition(int organizerPetitionID, User userID, byte[] document, LocalDateTime applicationDate,
            int status) {
        this.organizerPetitionID = organizerPetitionID;
        this.userID = userID;
        this.document = document;
        this.applicationDate = applicationDate;
        this.status = status;
    }

    public int getOrganizerPetitionID() {
        return organizerPetitionID;
    }

    public void setOrganizerPetitionID(int organizerPetitionID) {
        this.organizerPetitionID = organizerPetitionID;
    }

    public User getUserID() {
        return userID;
    }

    public void setUserID(User userID) {
        this.userID = userID;
    }

    public byte[] getDocument() {
        return document;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
