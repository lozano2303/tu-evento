package TuEvento.Backend.controller;

import TuEvento.Backend.dto.SectionNameDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.SectionNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/section-names")
public class SectionNameController {

    @Autowired
    private SectionNameService sectionNameService;

    @PostMapping
    public ResponseEntity<ResponseDto<SectionNameDto>> insertSectionName(@RequestBody SectionNameDto sectionNameDto) {
        ResponseDto<SectionNameDto> response = sectionNameService.insertSectionName(sectionNameDto);
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @PutMapping("/{sectionNameID}")
    public ResponseEntity<ResponseDto<String>> updateSectionName(
            @PathVariable Integer sectionNameID,
            @RequestBody SectionNameDto sectionNameDto) {
        ResponseDto<String> response = sectionNameService.updateSectionName(sectionNameID, sectionNameDto);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/{sectionNameID}")
    public ResponseEntity<ResponseDto<String>> deleteSectionName(@PathVariable Integer sectionNameID) {
        ResponseDto<String> response = sectionNameService.deleteSectionName(sectionNameID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<SectionNameDto>>> getAllSectionNames() {
        ResponseDto<List<SectionNameDto>> response = sectionNameService.getAllSectionNames();
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/{sectionNameID}")
    public ResponseEntity<ResponseDto<SectionNameDto>> getSectionNameById(@PathVariable Integer sectionNameID) {
        ResponseDto<SectionNameDto> response = sectionNameService.getSectionNameById(sectionNameID);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseDto<List<SectionNameDto>>> searchSectionNamesByName(@RequestParam String name) {
        ResponseDto<List<SectionNameDto>> response = sectionNameService.searchSectionNamesByName(name);
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}