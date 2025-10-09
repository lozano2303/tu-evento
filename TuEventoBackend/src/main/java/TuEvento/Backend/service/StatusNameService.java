package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.StatusNameDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface StatusNameService {

    ResponseDto<StatusNameDto> insertStatusName(StatusNameDto statusNameDto);

    ResponseDto<String> updateStatusName(int statusNameID, StatusNameDto statusNameDto);

    ResponseDto<String> deleteStatusName(int statusNameID);

    ResponseDto<List<StatusNameDto>> getAllStatusName();

    ResponseDto<StatusNameDto> getStatusNameById(int statusNameID);

}
