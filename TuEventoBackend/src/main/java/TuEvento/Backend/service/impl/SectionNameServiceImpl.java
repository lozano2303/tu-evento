package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.responses.ResponseDto;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.SectionNameDto;
import TuEvento.Backend.model.SectionName;
import TuEvento.Backend.repository.SectionNameRepository;
import TuEvento.Backend.service.SectionNameService;
import jakarta.transaction.Transactional;

@Service
public class SectionNameServiceImpl implements SectionNameService {

    @Autowired
    private SectionNameRepository sectionNameRepository;

    private SectionNameDto toDto(SectionName sectionName) {
        return new SectionNameDto(sectionName.getSectionNameID(), sectionName.getName());
    }

    private SectionName toEntity(SectionNameDto sectionNameDto) {
        SectionName sectionName = new SectionName();
        sectionName.setName(sectionNameDto.getName());
        return sectionName;
    }

    @Override
    @Transactional
    public ResponseDto<SectionNameDto> insertSectionName(SectionNameDto sectionNameDto) {
        try {
            // Validate name is not empty
            if (sectionNameDto.getName() == null || sectionNameDto.getName().trim().isEmpty()) {
                return ResponseDto.error("El nombre de la sección es obligatorio");
            }

            // Check if name already exists
            Optional<SectionName> existing = sectionNameRepository.findByNameIgnoreCase(sectionNameDto.getName());
            if (existing.isPresent()) {
                return ResponseDto.error("Ya existe un nombre de sección con ese nombre");
            }

            SectionName sectionName = toEntity(sectionNameDto);
            sectionName.setSectionNameID(null); // Let database generate ID
            SectionName savedSectionName = sectionNameRepository.save(sectionName);

            SectionNameDto savedDto = toDto(savedSectionName);
            return ResponseDto.ok("Nombre de sección insertado correctamente", savedDto);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar el nombre de sección: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateSectionName(Integer sectionNameID, SectionNameDto sectionNameDto) {
        Optional<SectionName> sectionNameOpt = sectionNameRepository.findById(sectionNameID);
        if (!sectionNameOpt.isPresent()) {
            return ResponseDto.error("Nombre de sección no encontrado");
        }

        try {
            // Validate name is not empty
            if (sectionNameDto.getName() == null || sectionNameDto.getName().trim().isEmpty()) {
                return ResponseDto.error("El nombre de la sección es obligatorio");
            }

            // Check if name already exists for another section
            Optional<SectionName> existing = sectionNameRepository.findByNameIgnoreCase(sectionNameDto.getName());
            if (existing.isPresent() && !existing.get().getSectionNameID().equals(sectionNameID)) {
                return ResponseDto.error("Ya existe otro nombre de sección con ese nombre");
            }

            SectionName sectionName = sectionNameOpt.get();
            sectionName.setName(sectionNameDto.getName());

            sectionNameRepository.save(sectionName);
            return ResponseDto.ok("Nombre de sección actualizado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el nombre de sección: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteSectionName(Integer sectionNameID) {
        Optional<SectionName> sectionNameOpt = sectionNameRepository.findById(sectionNameID);
        if (!sectionNameOpt.isPresent()) {
            return ResponseDto.error("Nombre de sección no encontrado");
        }

        try {
            sectionNameRepository.deleteById(sectionNameID);
            return ResponseDto.ok("Nombre de sección eliminado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al eliminar el nombre de sección: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar el nombre de sección: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<SectionNameDto> getSectionNameById(Integer sectionNameID) {
        Optional<SectionName> sectionNameOpt = sectionNameRepository.findById(sectionNameID);
        if (!sectionNameOpt.isPresent()) {
            return ResponseDto.error("Nombre de sección no encontrado");
        }

        SectionNameDto sectionNameDto = toDto(sectionNameOpt.get());
        return ResponseDto.ok("Nombre de sección encontrado", sectionNameDto);
    }

    @Override
    public ResponseDto<List<SectionNameDto>> getAllSectionNames() {
        List<SectionName> sectionNames = sectionNameRepository.findAll();

        if (sectionNames.isEmpty()) {
            return ResponseDto.error("No hay nombres de sección registrados");
        }

        List<SectionNameDto> sectionNamesDto = sectionNames.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Nombres de sección encontrados", sectionNamesDto);
    }

    @Override
    public ResponseDto<List<SectionNameDto>> searchSectionNamesByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseDto.error("El nombre de búsqueda es obligatorio");
        }

        List<SectionName> sectionNames = sectionNameRepository.findByNameContainingIgnoreCase(name);

        List<SectionNameDto> sectionNamesDto = sectionNames.stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return ResponseDto.ok("Búsqueda completada", sectionNamesDto);
    }
}