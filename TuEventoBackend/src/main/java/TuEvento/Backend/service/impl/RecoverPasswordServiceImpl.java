package TuEvento.Backend.service.impl;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.RecoverPasswordDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.RecoverPassword;
import TuEvento.Backend.repository.RecoverPasswordRepository;
import TuEvento.Backend.service.RecoverPasswordService;
import jakarta.transaction.Transactional;
@Service
public class RecoverPasswordServiceImpl implements RecoverPasswordService {
    @Autowired
    private RecoverPasswordRepository recoverPasswordRepository;

    @Override
        @Transactional
        public ResponseDto<String> insertRecoverPassword(RecoverPasswordDto recoverPasswordDto) {
            try {
                RecoverPassword entity = new RecoverPassword();
                entity.setCode(recoverPasswordDto.getCode());
                entity.setCodeStatus(recoverPasswordDto.isCodeStatus());
                entity.setExpieres(recoverPasswordDto.getExpieres());
                entity.setLastPasswordChange(recoverPasswordDto.getLastPasswordChange());

                recoverPasswordRepository.save(entity);

                return ResponseDto.ok("Recover_password inserted successfully");
            } catch (DataAccessException e) {
                return ResponseDto.error("Error de la base de datos");
            } catch (Exception e) {
                return ResponseDto.error("Error inesperado al insertar Recover_password");
            }
        }

    @Override
    @Transactional
    public ResponseDto<String> updateRecoverPassword(int recoverPasswordID, RecoverPasswordDto recoverPasswordDto) {
        try {
            RecoverPassword entity = recoverPasswordRepository.findById(recoverPasswordID)
                    .orElseThrow(() -> new RuntimeException("Recover_password no encontrado"));

            entity.setCode(recoverPasswordDto.getCode());
            entity.setLastPasswordChange(recoverPasswordDto.getLastPasswordChange());
            entity.setCodeStatus(recoverPasswordDto.isCodeStatus());
            entity.setExpieres(recoverPasswordDto.getExpieres());

            recoverPasswordRepository.save(entity);

            return ResponseDto.ok("Recover_password updated successfully");
        } catch (DataAccessException e) {
            return ResponseDto.error("Error de la base de datos");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al actualizar Recover_password");
        }
    }
}
