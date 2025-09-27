package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.EventImgRequestDto;
import TuEvento.Backend.dto.EventImgResponseDto;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.EventImg;
import TuEvento.Backend.repository.EventImgRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.service.EventImgService;
import TuEvento.Backend.service.aws.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventImgServiceImpl implements EventImgService {

    private final EventImgRepository eventImgRepository;
    private final EventRepository eventRepository;
    private final StorageService storageService;

    @Override
    public EventImgResponseDto saveEventImg(EventImgRequestDto requestDto) {
        // Validar archivo
        if (requestDto.getFile() == null || requestDto.getFile().isEmpty()) {
            throw new RuntimeException("El archivo es requerido");
        }

        // Validar tipo de archivo (solo imágenes)
        String contentType = requestDto.getFile().getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Solo se permiten archivos de imagen");
        }

        // Validar tamaño del archivo (ej. máximo 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (requestDto.getFile().getSize() > maxSize) {
            throw new RuntimeException("El tamaño del archivo excede el límite máximo de 5MB");
        }

        // Validar order
        if (requestDto.getOrder() <= 0) {
            throw new RuntimeException("El orden debe ser un entero positivo");
        }

        Event event = eventRepository.findById((int) requestDto.getEventId())
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        // Validar que el order sea único para el evento
        boolean orderExists = eventImgRepository.findAllByEventIdOrderByOrderAsc((int) requestDto.getEventId())
                .stream()
                .anyMatch(img -> img.getOrder() == requestDto.getOrder());
        if (orderExists) {
            throw new RuntimeException("El orden " + requestDto.getOrder() + " ya existe para este evento");
        }

        String fileName = storageService.uploadFile(requestDto.getFile());
        String url = "https://" + "tu-evento-storage" + ".s3.amazonaws.com/" + fileName; // Ajustar según configuración

        EventImg eventImg = new EventImg();
        eventImg.setEvent(event);
        eventImg.setUrl(url);
        eventImg.setOrder(requestDto.getOrder());

        EventImg saved = eventImgRepository.save(eventImg);

        return new EventImgResponseDto(saved.getEventImgID(), saved.getUrl(), saved.getOrder());
    }

    @Override
    public List<EventImgResponseDto> getEventImgsByEventId(int eventId) {
        List<EventImg> images = eventImgRepository.findAllByEventIdOrderByOrderAsc(eventId);
        if (images.isEmpty()) {
            throw new RuntimeException("El evento no tiene imágenes asociadas");
        }
        return images.stream()
                .map(img -> {
                    String cleanUrl = img.getUrl().replace("File uploaded : ", "");
                    return new EventImgResponseDto(img.getEventImgID(), cleanUrl, img.getOrder());
                })
                .collect(Collectors.toList());
    }

    @Override
    public void deleteEventImg(int eventImgId) {
        EventImg eventImg = eventImgRepository.findById(eventImgId)
                .orElseThrow(() -> new RuntimeException("Imagen del evento no encontrada"));

        String cleanUrl = eventImg.getUrl().replace("File uploaded : ", "");
        String fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
        storageService.deleteFile(fileName);

        eventImgRepository.delete(eventImg);
    }
}