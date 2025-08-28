package TuEvento.Backend.controller;

import TuEvento.Backend.dto.DepartmentDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments") 
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<ResponseDto<DepartmentDto>> insertDepartment(@RequestBody DepartmentDto departmentDto) {
        ResponseDto<DepartmentDto> response = departmentService.insertDepartment(departmentDto);
        
        return ResponseEntity.status(response.isSuccess() ? 201 : 400).body(response);
    }

    @PutMapping("/{departmentID}")
    public ResponseEntity<ResponseDto<String>> updateDepartment(
            @PathVariable int departmentID, 
            @RequestParam String newName) {
        ResponseDto<String> response = departmentService.updateDepartment(departmentID, newName);
        
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/{departmentID}")
    public ResponseEntity<ResponseDto<String>> deleteDepartment(@PathVariable int departmentID) {
        ResponseDto<String> response = departmentService.deleteDepartment(departmentID);
        
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<DepartmentDto>>> getAllDepartments() {
        ResponseDto<List<DepartmentDto>> response = departmentService.getAllDepartments();
        
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }

    @GetMapping("/{departmentID}")
    public ResponseEntity<ResponseDto<DepartmentDto>> getDepartmentById(@PathVariable int departmentID) {
        ResponseDto<DepartmentDto> response = departmentService.getDepartmentById(departmentID);
        
        return ResponseEntity.status(response.isSuccess() ? 200 : 404).body(response);
    }
}
