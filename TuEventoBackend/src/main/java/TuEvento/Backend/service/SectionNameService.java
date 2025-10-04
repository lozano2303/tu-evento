package TuEvento.Backend.service;

import java.util.List;
import TuEvento.Backend.dto.SectionNameDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface SectionNameService {
    ResponseDto<SectionNameDto> insertSectionName(SectionNameDto sectionNameDto);
    ResponseDto<String> updateSectionName(Integer sectionNameID, SectionNameDto sectionNameDto);
    ResponseDto<String> deleteSectionName(Integer sectionNameID);
    ResponseDto<List<SectionNameDto>> getAllSectionNames();
    ResponseDto<SectionNameDto> getSectionNameById(Integer sectionNameID);
    ResponseDto<List<SectionNameDto>> searchSectionNamesByName(String name);
}