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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.io.IOException;

@Service
public class OrganizerPetitionServiceImpl implements OrganizerPetitionService {

    @Autowired
    private OrganizerPetitionRepository petitionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    //@Transactional
    public ResponseDto<String> submitPetition(int userID, MultipartFile file) {
        try {
            // Validar si el usuario existe
            Optional<User> userOpt = userRepository.findById(userID);
            if (userOpt.isEmpty()) {
                return ResponseDto.error("Usuario no encontrado");
            }

            // Validar si ya existe petición para este usuario
            if (petitionRepository.existsByUserID_UserID(userID)) {
                return ResponseDto.error("Ya existe una petición para este usuario");
            }

            // Validar archivo
            if (file == null || file.isEmpty()) {
                return ResponseDto.error("El archivo está vacío o no fue enviado");
            }

            // Validar que sea PDF
            String contentType = file.getContentType();
            if (!"application/pdf".equals(contentType)) {
                throw new IllegalArgumentException("Solo se permiten archivos PDF");
            }

            // Crear petición
            OrganizerPetition petition = new OrganizerPetition();
            petition.setUserID(userOpt.get());
            petition.setDocument(file.getBytes()); // 🔹 Guardar como bytea
            petition.setApplicationDate(LocalDateTime.now());
            petition.setStatus(0);

            // Guardar en DB
            petitionRepository.save(petition);

            return ResponseDto.ok("Petición enviada correctamente");

        } catch (DataAccessException e) {
            e.printStackTrace();
            return ResponseDto.error("Error de base de datos: " + e.getMostSpecificCause().getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseDto.error("Error al leer el archivo: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDto.error("Error inesperado: " + e.getMessage());
        }
    }



    @Override
    public ResponseDto<List<OrganizerPetitionDto>> getAllPetitions() {
        List<OrganizerPetition> petitions = petitionRepository.findAll();
        List<OrganizerPetitionDto> dtoList = petitions.stream()
                .map(p -> new OrganizerPetitionDto(
                        p.getOrganizerPetitionID(),
                        p.getUserID().getUserID(),
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
                petition.getOrganizerPetitionID(),
                petition.getUserID().getUserID(),
                petition.getStatus()
        );

        return ResponseDto.ok("Petición encontrada", dto);
    }

    @Override
    public ResponseDto<String> updatePetitionStatus(int petitionID, int newStatus) {
        Optional<OrganizerPetition> petitionOpt = petitionRepository.findById(petitionID);
        if (petitionOpt.isEmpty()) {
            return ResponseDto.error("Petición no encontrada");
        }

        try {
            OrganizerPetition petition = petitionOpt.get();
            petition.setStatus(newStatus);
            petitionRepository.save(petition);

            // Obtener el usuario relacionado
            User user = petition.getUserID(); // Asegúrate de tener este método en OrganizerPetition

            // Actualizar el campo organizer según el estado
            if (newStatus == 1) { // Aprobado
                user.setOrganicer(true);
            } else if (newStatus == 2) { // Rechazado
                user.setOrganicer(false);
            }
            userRepository.save(user); // Guarda los cambios en el usuario

            return ResponseDto.ok("Estado actualizado correctamente");
        } catch (Exception e) {
            return ResponseDto.error("Error al actualizar el estado de la petición");
        }
    }

}
