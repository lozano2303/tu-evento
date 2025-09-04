package TuEvento.Backend.controller;

import TuEvento.Backend.dto.OrganizerPetitionDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.OrganizerPetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizer-petitions")
public class OrganizerPetitionController {

    @Autowired
    private OrganizerPetitionService petitionService;

    @PostMapping
    public ResponseEntity<ResponseDto<String>> submitPetition(@RequestBody OrganizerPetitionDto petitionDto) {
        ResponseDto<String> response = petitionService.submitPetition(petitionDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<OrganizerPetitionDto>>> getAllPetitions() {
        ResponseDto<List<OrganizerPetitionDto>> response = petitionService.getAllPetitions();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/user/{userID}")
    public ResponseEntity<ResponseDto<OrganizerPetitionDto>> getPetitionByUserID(@PathVariable int userID) {
        ResponseDto<OrganizerPetitionDto> response = petitionService.getPetitionByUserID(userID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @PutMapping("/{petitionID}/status")
    public ResponseEntity<ResponseDto<String>> updatePetitionStatus(
            @PathVariable int petitionID,
            @RequestParam int status) {
        ResponseDto<String> response = petitionService.updatePetitionStatus(petitionID, status);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
}
