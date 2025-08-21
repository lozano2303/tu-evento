package TuEvento.Backend.controller;

import TuEvento.Backend.dto.UserDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseDto<UserDto> createUser(@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @PutMapping("/{id}/telephone")
    public ResponseDto<String> updateTelephone(@PathVariable int id, @RequestParam String newTelephone) {
        return userService.updateTelephone(id, newTelephone);
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