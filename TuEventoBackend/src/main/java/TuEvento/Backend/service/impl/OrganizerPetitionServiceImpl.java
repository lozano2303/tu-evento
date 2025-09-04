package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.OrganizerPetitionDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.OrganizerPetition;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.OrganizerPetitionRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.OrganizerPetitionService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizerPetitionServiceImpl implements OrganizerPetitionService {

    @Autowired
    private OrganizerPetitionRepository petitionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public ResponseDto<String> submitPetition(OrganizerPetitionDto petitionDto) {
        Optional<User> userOpt = userRepository.findById(petitionDto.getUserID());
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        if (petitionRepository.existsByUserID_UserID(petitionDto.getUserID())) {
            return ResponseDto.error("Ya existe una petición para este usuario");
        }

        try {
            OrganizerPetition petition = new OrganizerPetition();
            petition.setUserID(userOpt.get());
            petition.setApplicationDate(petitionDto.getApplicationDate());
            petition.setDocument(Base64.getDecoder().decode(petitionDto.getDocumentBase64()));
            petition.setStatus(0); // Estado inicial: pendiente

            petitionRepository.save(petition);
            return ResponseDto.ok("Petición enviada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al registrar la petición");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al registrar la petición");
        }
    }

    @Override
    public ResponseDto<List<OrganizerPetitionDto>> getAllPetitions() {
        List<OrganizerPetition> petitions = petitionRepository.findAll();
        List<OrganizerPetitionDto> dtoList = petitions.stream()
                .map(p -> new OrganizerPetitionDto(
                        p.getUserID().getUserID(),
                        Base64.getEncoder().encodeToString(p.getDocument()),
                        p.getApplicationDate(),
                        p.getStatus()
                ))
                .collect(Collectors.toList());

        return ResponseDto.ok("Peticiones encontradas", dtoList);
    }

    @Override
    public ResponseDto<OrganizerPetitionDto> getPetitionByUserID(int userID) {
        Optional<OrganizerPetition> petitionOpt = petitionRepository.findAll()
                .stream()
                .filter(p -> p.getUserID().getUserID() == userID)
                .findFirst();

        if (petitionOpt.isEmpty()) {
            return ResponseDto.error("Petición no encontrada para el usuario");
        }

        OrganizerPetition petition = petitionOpt.get();
        OrganizerPetitionDto dto = new OrganizerPetitionDto(
                petition.getUserID().getUserID(),
                Base64.getEncoder().encodeToString(petition.getDocument()),
                petition.getApplicationDate(),
                petition.getStatus()
        );

        return ResponseDto.ok("Petición encontrada", dto);
    }

    @Override
    @Transactional
    public ResponseDto<String> updatePetitionStatus(int petitionID, int newStatus) {
        Optional<OrganizerPetition> petitionOpt = petitionRepository.findById(petitionID);
        if (petitionOpt.isEmpty()) {
            return ResponseDto.error("Petición no encontrada");
        }

        try {
            OrganizerPetition petition = petitionOpt.get();
            petition.setStatus(newStatus);
            petitionRepository.save(petition);
            return ResponseDto.ok("Estado actualizado correctamente");
        } catch (Exception e) {
            return ResponseDto.error("Error al actualizar el estado de la petición");
        }
    }
}
