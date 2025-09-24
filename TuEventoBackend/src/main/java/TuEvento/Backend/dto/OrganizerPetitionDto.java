package TuEvento.Backend.dto;

public class OrganizerPetitionDto {

    private int petitionID;
    private int userID;
    private int status;

    public OrganizerPetitionDto() {}

    public OrganizerPetitionDto(int petitionID, int userID, int status) {
        this.petitionID = petitionID;
        this.userID = userID;
        this.status = status;
    }

    public int getPetitionID() {
        return petitionID;
    }

    public void setPetitionID(int petitionID) {
        this.petitionID = petitionID;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
