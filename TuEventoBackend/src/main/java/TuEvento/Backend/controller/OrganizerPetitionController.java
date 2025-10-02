package TuEvento.Backend.controller;

import TuEvento.Backend.dto.OrganizerPetitionDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.OrganizerPetition;
import TuEvento.Backend.repository.OrganizerPetitionRepository;
import TuEvento.Backend.service.OrganizerPetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/organizer-petitions")
public class OrganizerPetitionController {

    @Autowired
    private OrganizerPetitionService petitionService;

    @Autowired
    private OrganizerPetitionRepository petitionRepository;

    // Subir petición con archivo + userID
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ResponseDto<String>> submitPetition(
            @RequestParam int userID,
            @RequestParam("file") MultipartFile file) {

        try {
            ResponseDto<String> response = petitionService.submitPetition(userID, file);
            return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDto.error("Error interno del servidor"));
        }
    }

    // Listar todas las peticiones
    @GetMapping
    public ResponseEntity<ResponseDto<List<OrganizerPetitionDto>>> getAllPetitions() {
        ResponseDto<List<OrganizerPetitionDto>> response = petitionService.getAllPetitions();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // Obtener petición por userID
    @GetMapping("/user/{userID}")
    public ResponseEntity<ResponseDto<OrganizerPetitionDto>> getPetitionByUserID(@PathVariable int userID) {
        ResponseDto<OrganizerPetitionDto> response = petitionService.getPetitionByUserID(userID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    // Actualizar estado
    @PutMapping("/{petitionID}/status")
    public ResponseEntity<ResponseDto<String>> updatePetitionStatus(
            @PathVariable int petitionID,
            @RequestParam int status) {
        ResponseDto<String> response = petitionService.updatePetitionStatus(petitionID, status);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    // 📌 Nuevo endpoint: Descargar documento
    @GetMapping("/{petitionID}/document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable int petitionID) {
        Optional<OrganizerPetition> petitionOpt = petitionRepository.findById(petitionID);

        if (petitionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OrganizerPetition petition = petitionOpt.get();
        byte[] document = petition.getDocument();

        // Si quieres detectar el tipo real (PDF, PNG, etc.) puedes guardarlo en DB
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document.pdf")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(document);
    }
}
