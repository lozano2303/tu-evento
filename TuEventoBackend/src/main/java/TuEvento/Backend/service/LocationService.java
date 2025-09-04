package TuEvento.Backend.service;

import TuEvento.Backend.dto.LocationDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface LocationService {
    ResponseDto<LocationDto> insertLocation(LocationDto locationDto);
    ResponseDto<String> updateLocation(int locationID, LocationDto locationDto);
    ResponseDto<String> deleteLocation(int locationID);
    ResponseDto<List<LocationDto>> getAllLocations();
    ResponseDto<LocationDto> getLocationById(int locationID);
}
