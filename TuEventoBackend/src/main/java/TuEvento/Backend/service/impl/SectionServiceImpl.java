package TuEvento.Backend.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;


import TuEvento.Backend.dto.SectionDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.Section;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.SectionName;
import TuEvento.Backend.repository.SectionRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.SectionNameRepository;
import TuEvento.Backend.service.SectionService;
import TuEvento.Backend.service.SeatService;


@Service
public class SectionServiceImpl implements SectionService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SectionNameRepository sectionNameRepository;

    @Autowired
    private SeatService seatService;

    // Función para sanitizar strings eliminando caracteres de control
    private String sanitizeString(String str) {
        if (str == null) return null;
        // Reemplazar caracteres de control con espacios
        return str.replaceAll("[\\x00-\\x1F\\x7F-\\x9F\\u2000-\\u200F\\u2028-\\u202F\\u205F-\\u206F]", " ").trim();
    }

    @Override
    @Transactional
    public ResponseDto<SectionDto> insertSection(SectionDto sectionDto) {
        try {
            // Check if section with same sectionNameID already exists for this event
            Optional<Section> existingSection = sectionRepository.findByEventID_IdAndSectionNameID_SectionNameID(sectionDto.getEventId(), sectionDto.getSectionNameID());
            if (existingSection.isPresent()) {
                return ResponseDto.error("Ya existe una sección con este nombre para este evento");
            }

            Section entity = new Section();
            entity.setEventID(eventRepository.findById(sectionDto.getEventId()).orElseThrow(() -> new RuntimeException("Event not found")));
            entity.setSectionNameID(sectionNameRepository.findById(sectionDto.getSectionNameID()).orElseThrow(() -> new RuntimeException("SectionName not found")));
            entity.setPrice(BigDecimal.valueOf(sectionDto.getPrice()));
            Section savedEntity = sectionRepository.save(entity);

            // Convertir la entidad guardada a DTO y devolverla
            SectionDto savedDto = toDto(savedEntity);
            return ResponseDto.ok("Section insertada exitosamente", savedDto);
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar Section");
        }
    }
    @Override
    public ResponseDto<List<SectionDto>> getAllSections() {
        List<SectionDto> sectionsDto = sectionRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseDto.ok("Secciones encontradas", sectionsDto);
    }

    private SectionDto toDto(Section section) {
        SectionDto dto = new SectionDto();
        dto.setSectionID(section.getSectionID());
        dto.setEventId(section.getEventID().getId());
        dto.setSectionNameID(section.getSectionNameID().getSectionNameID());
        dto.setPrice(section.getPrice().doubleValue());
        // Sanitizar el nombre de la sección si es necesario
        if (section.getSectionNameID().getName() != null) {
            section.getSectionNameID().setName(sanitizeString(section.getSectionNameID().getName()));
        }
        return dto;
    }
    @Override
    @Transactional
    public ResponseDto<SectionDto> updateSection(SectionDto sectionDto) {
        try {
            Optional<Section> section = sectionRepository.findById(sectionDto.getSectionID());
            if (section.isPresent()) {
                Section entity = section.get();
                entity.setSectionNameID(sectionNameRepository.findById(sectionDto.getSectionNameID()).orElseThrow(() -> new RuntimeException("SectionName not found")));
                entity.setPrice(BigDecimal.valueOf(sectionDto.getPrice()));
                sectionRepository.save(entity);

                return ResponseDto.ok("Section actualizada exitosamente");
            } else {
                return ResponseDto.error("Section no encontrada");
            }
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar Section");
        }
    }
    @Override
    @Transactional
    public ResponseDto<SectionDto> deleteSection(int id) {
        Optional<Section> sectionOpt = sectionRepository.findById(id);
        if (!sectionOpt.isPresent()) {
            return ResponseDto.error("Section no encontrada");
        }
        try {
            // First delete all seats associated with this section
            ResponseDto<String> seatDeleteResult = seatService.deleteSeatsBySection(id);
            if (!seatDeleteResult.isSuccess()) {
                return ResponseDto.error("Error al eliminar asientos de la sección: " + seatDeleteResult.getMessage());
            }

            // Then delete the section itself
            sectionRepository.deleteById(id);
            return ResponseDto.ok("Section y sus asientos eliminados exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar Section");
        }
    }
    @Override
    public ResponseDto<SectionDto> getSectionById(int id) {
        Optional<Section> section = sectionRepository.findById(id);
        if (section.isPresent()) {
            SectionDto dto = toDto(section.get());
            return ResponseDto.ok("Section encontrada", dto);
        } else {
            return ResponseDto.error("Section no encontrada");
        }
    }


}
