package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.DepartmentDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface DepartmentService {
    ResponseDto<DepartmentDto> insertDepartment(DepartmentDto departmentDto);
    ResponseDto<String> updateDepartment(int departmentID, String newName);
    ResponseDto<String> deleteDepartment(int departmentID);
    ResponseDto<List<DepartmentDto>> getAllDepartments();
    ResponseDto<DepartmentDto> getDepartmentById(int departmentID);
}
