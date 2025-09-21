package TuEvento.Backend.controller;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/{id}/telephone")
    public ResponseDto<String> updateTelephone(@PathVariable int id, @RequestParam String newTelephone) {
        return userService.updateTelephone(id, newTelephone);
    }

    @PutMapping("/{id}/birthdate")
    public ResponseDto<String> updateBirthDate(@PathVariable int id, @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date newBirthDate) {
        return userService.updateBirthDate(id, newBirthDate);
    }

    @PutMapping("/{id}/address")
    public ResponseDto<String> updateAddress(@PathVariable int id, @RequestParam Integer newAddressId) {
        return userService.updateAddress(id, newAddressId);
    }

    @DeleteMapping("/{id}/delete-account")
    public ResponseDto<String> deleteUserAccount(@PathVariable int id) {
        return userService.deleteUserAccount(id);
    }

    @PutMapping("/{id}/deactivate")
    public ResponseDto<String> deactivateUser(@PathVariable int id) {
        return userService.deactivateUser(id);
    }

    @PutMapping("/{id}/reactivate")
    public ResponseDto<String> reactivateUser(@PathVariable int id) {
        return userService.reactivateUser(id);
    }

    @GetMapping("/{id}")
    public ResponseDto<UserDto> getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    @GetMapping("/search")
    public ResponseDto<List<UserDto>> getUsersByName(@RequestParam String name) {
        return userService.getUsersByName(name);
    }

    @GetMapping
    public ResponseDto<List<UserDto>> getAllUsers() {
        return userService.getAllUsers();
    }
}