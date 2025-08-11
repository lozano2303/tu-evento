package TuEvento.Backend.service;

import TuEvento.Backend.dto.RegisterRequestDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface RegisterService {
    ResponseDto<String> register(RegisterRequestDto registerRequestDto);
}