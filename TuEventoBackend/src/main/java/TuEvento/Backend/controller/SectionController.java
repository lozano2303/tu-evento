package TuEvento.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import TuEvento.Backend.dto.SectionDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.SectionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @PostMapping
    public ResponseDto<SectionDto> insertSection(@RequestBody SectionDto sectionDto) {
        return sectionService.insertSection(sectionDto);
    }

    @GetMapping
    public List<SectionDto> getAllSections() {
        return sectionService.getAllSections();
    }

    @PutMapping
    public ResponseDto<SectionDto> updateSection(@RequestBody SectionDto sectionDto) {
        return sectionService.updateSection(sectionDto);
    }

    @DeleteMapping("/{id}")
    public ResponseDto<SectionDto> deleteSection(@PathVariable int id) {
        return sectionService.deleteSection(id);
    }

    @GetMapping("/{id}")
    public ResponseDto<SectionDto> getSectionById(@PathVariable int id) {
        return sectionService.getSectionById(id);
    }
}