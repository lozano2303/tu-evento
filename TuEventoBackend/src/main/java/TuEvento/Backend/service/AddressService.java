package TuEvento.Backend.service;

import TuEvento.Backend.dto.AddressDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import java.util.List;

public interface AddressService {
    ResponseDto<Integer> insertAddress(AddressDto addressDto);
    ResponseDto<String> updateAddress(int addressID, AddressDto addressDto);
    ResponseDto<String> deleteAddress(int addressID);
    ResponseDto<List<AddressDto>> getAllAddresses();
    ResponseDto<AddressDto> getAddressById(int addressID);
}
