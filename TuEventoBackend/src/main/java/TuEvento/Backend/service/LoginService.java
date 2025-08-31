package TuEvento.Backend.service;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseLogin;

public interface LoginService {
    ResponseDto<ResponseLogin> login(LoginDto loginDto); // Cambiado de String a ResponseLogin
    ResponseDto<String> save(RequestLoginDTO requestLoginDTO);
}