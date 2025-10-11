package TuEvento.Backend.service.impl;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import TuEvento.Backend.dto.StatusNameDto;
import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.StatusName;
import TuEvento.Backend.repository.StatusNameRepository;
import TuEvento.Backend.service.StatusNameService;


@Service
public class StatusNameServiceImpl implements StatusNameService {
    @Autowired
    private StatusNameRepository statusNameRepository;

    @Override
    @Transactional
    public ResponseDto<StatusNameDto> insertStatusName(StatusNameDto statusNameDto) {
        try{
        StatusName statusName = new StatusName();
        statusName.setStatusName(statusNameDto.getStatusName().trim());
        statusNameRepository.save(statusName);
        return ResponseDto.ok("StatusName guardado correctamente", new StatusNameDto(statusName.getStatusNameID(), statusName.getStatusName()));
        }catch(Exception e){
            return ResponseDto.error("Error al guardar StatusName: " + e.getMessage());
        }
    }
    @Override
    @Transactional
    public ResponseDto<String> deleteStatusName(int statusNameID) {
        try {
            Optional <StatusName> statusName = statusNameRepository.findById(statusNameID);
            if(statusName.isPresent()){
                statusNameRepository.delete(statusName.get());
                return ResponseDto.ok("StatusName eliminado correctamente");
            } else {
                return ResponseDto.error("StatusName no encontrado");
            }
        } catch (Exception e) {
           return ResponseDto.error("Error al eliminar StatusName: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<List<StatusNameDto>> getAllStatusName() {
        try {
            List<StatusName> status = statusNameRepository.findAll();
            List<StatusNameDto> StatusNameDtos = status.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            return ResponseDto.ok("Eventos obtenidos correctamente", StatusNameDtos);

        } catch (Exception e) {
            return ResponseDto.error("Error al obtener los eventos: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<StatusNameDto> getStatusNameById(int statusNameID) {
        try {
            Optional<StatusName> statusNameOpt = statusNameRepository.findById(statusNameID);
            if(statusNameOpt.isPresent()){
                StatusName statusName = statusNameOpt.get();
                StatusNameDto dto = toDto(statusName);
                return ResponseDto.ok("StatusName encontrado", dto);
            } else {
                return ResponseDto.error("StatusName no encontrado");
            }
        } catch (Exception e) {
            return ResponseDto.error("Error al obtener StatusName: " + e.getMessage());
        }
    }

    private StatusNameDto toDto(StatusName statusName) {
        StatusNameDto statusNameDto = new StatusNameDto();
        statusNameDto.setStatusNameID(statusName.getStatusNameID());
        statusNameDto.setStatusName(statusName.getStatusName());
        return statusNameDto;
    }
    @Override
    @Transactional
    public ResponseDto<String> updateStatusName(int statusNameID, StatusNameDto statusNameDto) {
        try {
            Optional<StatusName> statusNameOpt = statusNameRepository.findById(statusNameID);
            if(statusNameOpt.isPresent()){
                statusNameOpt.get().setStatusName(statusNameDto.getStatusName());
                statusNameRepository.save(statusNameOpt.get());
                return ResponseDto.ok("StatusName actualizado correctamente");
            } else {
                return ResponseDto.error("StatusName no encontrado");
            }
        } catch (Exception e) {
            return ResponseDto.error("Error al actualizar StatusName: " + e.getMessage());
        }
    }
}