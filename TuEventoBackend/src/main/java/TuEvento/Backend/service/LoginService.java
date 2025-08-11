package TuEvento.Backend.service;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface LoginService {
    ResponseDto<String> login(LoginDto loginDto);
}