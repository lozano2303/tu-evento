package TuEvento.Backend.service;



import TuEvento.Backend.dto.RecoverPasswordDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface RecoverPasswordService {
    ResponseDto<String> insertRecoverPassword(RecoverPasswordDto recoverPasswordDto);

    ResponseDto<String> updateRecoverPassword(String recoverPasswordID, RecoverPasswordDto recoverPasswordDto);

}
