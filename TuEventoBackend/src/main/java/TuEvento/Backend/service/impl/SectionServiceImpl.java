package TuEvento.Backend.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import TuEvento.Backend.dto.SectionDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.Section;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.repository.SectionRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.SectionService;


@Service
public class SectionServiceImpl implements SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Override
    @Transactional
    public ResponseDto<SectionDto> insertSection(SectionDto sectionDto) {
        try {
            Section entity = new Section();
            entity.setEventID(eventRepository.findById(sectionDto.getEventId()).orElseThrow(() -> new RuntimeException("Event not found")));
            entity.setSectionName(sectionDto.getSectionName());
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
    public List<SectionDto> getAllSections() {
        return sectionRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SectionDto toDto(Section section) {
        SectionDto dto = new SectionDto();
        dto.setSectionID(section.getSectionID());
        dto.setEventId(section.getEventID().getId());
        dto.setSectionName(section.getSectionName());
        dto.setPrice(section.getPrice().doubleValue());
        return dto;
    }
    @Override
    @Transactional
    public ResponseDto<SectionDto> updateSection(SectionDto sectionDto) {
        try {
            Optional<Section> section = sectionRepository.findById(sectionDto.getSectionID());
            if (section.isPresent()) {
                Section entity = section.get();
                entity.setSectionName(sectionDto.getSectionName());
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
            sectionRepository.deleteById(id);
            return ResponseDto.ok("Section eliminada exitosamente");
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
