package TuEvento.Backend.service;

import TuEvento.Backend.dto.CityDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface CityService {
    ResponseDto<CityDto> insertCity(CityDto cityDto);
    ResponseDto<String> updateCity(int cityID, CityDto cityDto);
    ResponseDto<String> deleteCity(int cityID);
    ResponseDto<List<CityDto>> getAllCities();
    ResponseDto<CityDto> getCityById(int cityID);
    ResponseDto<List<CityDto>> getCitiesByDepartment(int departmentId);
}
