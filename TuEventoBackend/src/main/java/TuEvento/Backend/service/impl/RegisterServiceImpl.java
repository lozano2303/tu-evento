package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Role;
import TuEvento.Backend.model.Address;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.AddressRepository;
import TuEvento.Backend.service.RegisterService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RegisterServiceImpl implements RegisterService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
//@Transactional
public ResponseDto<String> register(RegisterRequestDto dto) {
    try {
        // Validar si el correo ya existe en Login
        if (loginRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseDto.error("Correo electrónico existente");
        }

        Address address = null;
        if (dto.getAddress() != null) {
            Optional<Address> addressOpt = addressRepository.findById(dto.getAddress());
            if (addressOpt.isEmpty()) {
                return ResponseDto.error("Dirección no encontrada");
            }
            address = addressOpt.get();
        }


        // 1. Crear usuario
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setTelephone(dto.getTelephone());

        if (dto.getBirthDate() != null) {
            user.setBirthDate(new java.sql.Date(dto.getBirthDate().getTime()));
        }

        user.setAddress(address);
        user.setRole(Role.USER);
        user.setStatus(true);
        user.setActivated(false);

        userRepository.save(user);

        // 2. Crear login asociado CON CONTRASEÑA HASHEDA
        Login login = new Login();
        login.setEmail(dto.getEmail());
        login.setPassword(passwordEncoder.encode(dto.getPassword()));
        login.setLoginDate(LocalDateTime.now());
        login.setUserID(user);
        login.setUsername(dto.getEmail());

        loginRepository.save(login);

        return ResponseDto.ok("Usuario y login creados exitosamente");

    } catch (DataAccessException e) {
        return ResponseDto.error("Error de base de datos al registrar: " + e.getMessage());
    } catch (Exception e) {
        return ResponseDto.error("Error inesperado al registrar: " + e.getMessage());
    }
}
}
