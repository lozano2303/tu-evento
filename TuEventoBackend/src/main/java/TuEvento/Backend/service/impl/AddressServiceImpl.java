package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.AddressDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.City;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.repository.CityRepository;
import TuEvento.Backend.service.AddressService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CityRepository cityRepository;

    @Override
    @Transactional
    public ResponseDto<AddressDto> insertAddress(AddressDto addressDto) {
        Optional<City> cityOpt = cityRepository.findById(addressDto.getCityID());
        if (!cityOpt.isPresent()) {
            return ResponseDto.error("Ciudad no encontrada");
        }

        try {
            Address address = new Address();
            address.setStreet(addressDto.getStreet());
            address.setPostalCode(addressDto.getPostalCode());
            address.setCity(cityOpt.get());

            addressRepository.save(address);

            return ResponseDto.ok("Dirección insertada correctamente",
                    new AddressDto(addressDto.getCityID(), address.getStreet(), address.getPostalCode()));
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al insertar la dirección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateAddress(int addressID, AddressDto addressDto) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        Optional<City> cityOpt = cityRepository.findById(addressDto.getCityID());
        if (!cityOpt.isPresent()) {
            return ResponseDto.error("Ciudad no encontrada");
        }

        try {
            Address address = addressOpt.get();
            address.setStreet(addressDto.getStreet());
            address.setPostalCode(addressDto.getPostalCode());
            address.setCity(cityOpt.get());

            addressRepository.save(address);
            return ResponseDto.ok("Dirección actualizada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar la dirección");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deleteAddress(int addressID) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        try {
            addressRepository.deleteById(addressID);
            return ResponseDto.ok("Dirección eliminada correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos al eliminar la dirección");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al eliminar la dirección");
        }
    }

    @Override
    public ResponseDto<List<AddressDto>> getAllAddresses() {
        List<Address> addresses = addressRepository.findAll();
        List<AddressDto> addressesDto = addresses.stream()
                .map(address -> new AddressDto(
                        address.getCity().getCityID(),
                        address.getStreet(),
                        address.getPostalCode()))
                .collect(Collectors.toList());

        return ResponseDto.ok("Direcciones encontradas", addressesDto);
    }

    @Override
    public ResponseDto<AddressDto> getAddressById(int addressID) {
        Optional<Address> addressOpt = addressRepository.findById(addressID);
        if (!addressOpt.isPresent()) {
            return ResponseDto.error("Dirección no encontrada");
        }

        Address address = addressOpt.get();
        AddressDto addressDto = new AddressDto(
                address.getCity().getCityID(),
                address.getStreet(),
                address.getPostalCode());

        return ResponseDto.ok("Dirección encontrada", addressDto);
    }
}
