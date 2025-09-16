package TuEvento.Backend.service;

import TuEvento.Backend.dto.OrganizerPetitionDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface OrganizerPetitionService {

    ResponseDto<String> submitPetition(int userID, MultipartFile file);

    ResponseDto<List<OrganizerPetitionDto>> getAllPetitions();

    ResponseDto<OrganizerPetitionDto> getPetitionByUserID(int userID);

    ResponseDto<String> updatePetitionStatus(int petitionID, int newStatus);
}
