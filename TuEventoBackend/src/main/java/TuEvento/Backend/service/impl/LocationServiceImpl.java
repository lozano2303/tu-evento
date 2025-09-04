package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LocationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.Location;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.repository.LocationRepository;
import TuEvento.Backend.service.LocationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Override
    @Transactional
    public ResponseDto<LocationDto> insertLocation(LocationDto locationDto) {
        Optional<Address> addressOpt = addressRepository.findById(locationDto.getAddressID());
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        try {
            Location location = new Location();
            location.setName(locationDto.getName());
            location.setAddress(addressOpt.get());

            locationRepository.save(location);

            return ResponseDto.ok("Ubicación insertada correctamente",
                    new LocationDto(locationDto.getAddressID(), location.getName()));
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar la ubicación");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateLocation(int locationID, LocationDto locationDto) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        Optional<Address> addressOpt = addressRepository.findById(locationDto.getAddressID());
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        try {
            Location location = locationOpt.get();
            location.setName(locationDto.getName());
            location.setAddress(addressOpt.get());

            locationRepository.save(location);
            return ResponseDto.ok("Ubicación actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la ubicación");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteLocation(int locationID) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        try {
            locationRepository.deleteById(locationID);
            return ResponseDto.ok("Ubicación eliminada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar la ubicación");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la ubicación");
        }
    }

    @Override
    public ResponseDto<List<LocationDto>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        List<LocationDto> locationsDto = locations.stream()
                .map(loc -> new LocationDto(loc.getAddress().getAddressID(), loc.getName()))
                .collect(Collectors.toList());

        return ResponseDto.ok("Ubicaciones encontradas", locationsDto);
    }

    @Override
    public ResponseDto<LocationDto> getLocationById(int locationID) {
        Optional<Location> locationOpt = locationRepository.findById(locationID);
        if (!locationOpt.isPresent()) {
            return ResponseDto.error("Ubicación no encontrada");
        }

        Location location = locationOpt.get();
        LocationDto locationDto = new LocationDto(location.getAddress().getAddressID(), location.getName());

        return ResponseDto.ok("Ubicación encontrada", locationDto);
    }
}
