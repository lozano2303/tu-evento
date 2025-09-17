package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.SectionDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface SectionService {

    ResponseDto<SectionDto> insertSection(SectionDto sectionDto);

    List<SectionDto> getAllSections();

    ResponseDto<SectionDto> updateSection(SectionDto sectionDto);

    ResponseDto<SectionDto> deleteSection(int id);

    ResponseDto<SectionDto> getSectionById(int id);

}
