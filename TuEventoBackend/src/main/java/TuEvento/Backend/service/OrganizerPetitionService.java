package TuEvento.Backend.service;

import TuEvento.Backend.dto.OrganizerPetitionDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface OrganizerPetitionService {
    ResponseDto<String> submitPetition(OrganizerPetitionDto petitionDto);
    ResponseDto<List<OrganizerPetitionDto>> getAllPetitions();
    ResponseDto<OrganizerPetitionDto> getPetitionByUserID(int userID);
    ResponseDto<String> updatePetitionStatus(int petitionID, int newStatus);
}
