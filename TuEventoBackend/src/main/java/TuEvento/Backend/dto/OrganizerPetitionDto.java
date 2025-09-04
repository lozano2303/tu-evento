package TuEvento.Backend.dto;

import java.time.LocalDateTime;

public class OrganizerPetitionDto {

    private int userID;
    private String documentBase64;
    private LocalDateTime applicationDate;
    private int status;

    public OrganizerPetitionDto() {
    }

    public OrganizerPetitionDto(int userID, String documentBase64, LocalDateTime applicationDate, int status) {
        this.userID = userID;
        this.documentBase64 = documentBase64;
        this.applicationDate = applicationDate;
        this.status = status;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getDocumentBase64() {
        return documentBase64;
    }

    public void setDocumentBase64(String documentBase64) {
        this.documentBase64 = documentBase64;
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
