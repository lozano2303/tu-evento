package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.responses.ResponseDto;


public interface UserService {
    ResponseDto<String> updateTelephone(int userId, String newTelephone);
    ResponseDto<String> updateBirthDate(int userId, java.util.Date newBirthDate);
    ResponseDto<String> updateAddress(int userId, Integer newAddressId);
    ResponseDto<String> deleteUserAccount(int userId);
    ResponseDto<String> deactivateUser(int userId);
    ResponseDto<String> reactivateUser(int userId);
    ResponseDto<UserDto> getUserById(int userId);
    ResponseDto<List<UserDto>> getUsersByName(String name);
    ResponseDto<List<UserDto>> getAllUsers();
}