package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.RegisterService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RegisterServiceImpl implements RegisterService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LoginRepository loginRepository;

    @Override
    @Transactional
    public ResponseDto<String> register(RegisterRequestDto dto) {
        try {
            // Validar si el correo ya existe en Login
            if (loginRepository.findByEmail(dto.getEmail()).isPresent()) {
                return ResponseDto.error("Correo electrónico existente");
            }

            // 1. Crear usuario
            User user = new User();
            user.setFullName(dto.getFullName());
            user.setTelephone(dto.getTelephone());
            if (dto.getBirthDate() != null) {
                user.setBirthDate(new java.sql.Date(dto.getBirthDate().getTime()));
            }
            user.setAddress(dto.getAddress());
            user.setRole(Role.USER); // Enum Role
            user.setStatus(true);

            userRepository.save(user);

            // 2. Crear login asociado
            Login login = new Login();
            login.setEmail(dto.getEmail());
            login.setPassword(dto.getPassword()); // Deberías hashearla antes de producción
            login.setLoginDate(LocalDateTime.now());
            login.setUserID(user);

            loginRepository.save(login);

            return ResponseDto.ok("Usuario y login creados exitosamente");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al registrar");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al registrar");
        }
    }
}