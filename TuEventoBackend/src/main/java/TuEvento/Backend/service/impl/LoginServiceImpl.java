package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.LoginService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginRepository loginRepository;

    @Override
    public ResponseDto<String> login(LoginDto loginDto) {
        try {
            Login login = loginRepository.findByEmail(loginDto.getEmail());
            if (login == null) {
                return ResponseDto.error("Email no registrado");
            }
            // En producción, compara el hash, no el texto plano
            if (!login.getPassword().equals(loginDto.getPassword())) {
                return ResponseDto.error("Contraseña incorrecta");
            }
            // Aquí luego puedes retornar el JWT token
            return ResponseDto.ok("Login exitoso");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al iniciar sesión");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al iniciar sesión");
        }
    }
}