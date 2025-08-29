package TuEvento.Backend.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import TuEvento.Backend.dto.UserDto;

import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public ResponseDto<UserDto> createUser(UserDto userDto) {
        try {
            User user = new User();
            user.setFullName(userDto.getFullName());
            user.setTelephone(userDto.getTelephone());
            user.setBirthDate(userDto.getBirthDate());
            user.setAddress(userDto.getAddress());
            user.setRole(Role.USER);
            user.setStatus(true);
            user.setActivated(false);
            userRepository.save(user);

            return ResponseDto.ok("Usuario creado exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al crear el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al crear el usuario");
        }
    }
    public ResponseDto<UserDto> createUserSocialMedia(UserDto userDto) {
        try {
            User user = new User();
            user.setFullName(userDto.getFullName());
            user.setTelephone(userDto.getTelephone());
            user.setBirthDate(userDto.getBirthDate());
            user.setAddress(userDto.getAddress());
            user.setRole(Role.USER);
            user.setStatus(true);
            user.setActivated(true);
            userRepository.save(user);

            return ResponseDto.ok("Usuario creado exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al crear el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al crear el usuario");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> updateTelephone(int userId, String newTelephone) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }
        try {
            User user = userOpt.get();
            user.setTelephone(newTelephone);
            userRepository.save(user);
            return ResponseDto.ok("Teléfono actualizado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al actualizar el teléfono");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar el teléfono");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> deactivateUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }
        try {
            User user = userOpt.get();
            user.setStatus(false);
            userRepository.save(user);
            return ResponseDto.ok("Usuario desactivado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al desactivar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al desactivar el usuario");
        }
    }

    @Override
    @Transactional
    public ResponseDto<String> reactivateUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }
        try {
            User user = userOpt.get();
            user.setStatus(true);
            userRepository.save(user);
            return ResponseDto.ok("Usuario reactivado correctamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al reactivar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al reactivar el usuario");
        }
    }

    @Override
    public ResponseDto<UserDto> getUserById(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }
        UserDto userDto = mapToDto(userOpt.get());
        return ResponseDto.ok("Usuario encontrado", userDto);
    }

    @Override
    public ResponseDto<List<UserDto>> getUsersByName(String name) {
        List<User> users = userRepository.findByFullNameContainingIgnoreCase(name);
        List<UserDto> usersDto = users.stream()
            .map(this::mapToDto)
            .toList();
        return ResponseDto.ok("Usuarios encontrados", usersDto);
    }

    @Override
    public ResponseDto<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> usersDto = users.stream()
            .map(this::mapToDto)
            .toList();
        return ResponseDto.ok("Usuarios encontrados", usersDto);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByFullName(username)
                .stream()
                .findFirst();
    }


    private UserDto mapToDto(User user) {
        return new UserDto(
            user.getFullName(),
            user.getTelephone(),
            user.getBirthDate(),
            user.getAddress(),
            user.isActivated() 
        );
    }
}