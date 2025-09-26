package TuEvento.Backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.EventRatingDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.EventRating;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.EventRatingRepository;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.EventRatingService;

@Service
public class EventRatingServiceImpl implements EventRatingService {
    @Autowired
    private EventRatingRepository eventRatingRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private UserRepository userRepository;

    private EventRatingDto toDto(EventRating er) {
        return new EventRatingDto(
            er.getRatingID(),
            er.getUserId().getUserID(),
            er.getEventId().getId(),
            er.getRating(),
            er.getComment(),
            er.getCreatedAt()
        );
    }

    @Override
    public ResponseDto<EventRatingDto> deleteEventRating(EventRatingDto eventRatingDto) {
        try {
            Optional<EventRating> eventRating = eventRatingRepository.findById(eventRatingDto.getRatingID());
            if (eventRating.isPresent()) {
                eventRatingRepository.delete(eventRating.get());
                return new ResponseDto<>(true, "Calificación del evento eliminada exitosamente");
            } else {
                return new ResponseDto<>(false, "Calificación del evento no encontrada");
            }
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error eliminando la calificación del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventRatingDto> getEventRating(EventRatingDto eventRatingDto) {
        try {
            Optional<EventRating> eventRating = eventRatingRepository.findByComment(eventRatingDto.getComment());
            if (eventRating.isPresent()) {
                return new ResponseDto<>(true, "Calificación del evento encontrada", toDto(eventRating.get()));
            } else {
                return new ResponseDto<>(false, "Calificación del evento no encontrada");
            }
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo la calificación del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventRatingDto> insertEventRating(int userId, int eventId, EventRatingDto eventRatingDto) {
        try {
            if (userId == 0) {
                throw new RuntimeException("El usuario es inválido");
            }
            if (eventId == 0) {
                throw new RuntimeException("El evento es inválido");
            }
            if (eventRatingDto.getComment() == null || eventRatingDto.getComment().isEmpty()) {
                throw new RuntimeException("El comentario es inválido");
            }
            if (eventRatingDto.getRating() < 1 || eventRatingDto.getRating() > 5) {
                throw new RuntimeException("La calificación debe estar entre 1 y 5");
            }

            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            if (!user.isActivated()) {
                throw new RuntimeException("Cuenta no activada. No puedes calificar eventos.");
            }
            Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

            EventRating er = new EventRating();
            er.setUserId(user);
            er.setEventId(event);
            er.setRating(eventRatingDto.getRating());
            er.setComment(eventRatingDto.getComment());
            er.setCreatedAt(LocalDateTime.now());

            eventRatingRepository.save(er);

            return new ResponseDto<>(true, "Calificación del evento insertada exitosamente", toDto(er));
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error insertando la calificación del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventRatingDto> updateEventRating(EventRatingDto eventRatingDto) {
        try {
            Optional<EventRating> eventRating = eventRatingRepository.findById(eventRatingDto.getRatingID());
            if (eventRating.isPresent()) {
                EventRating er = eventRating.get();
                er.setRating(eventRatingDto.getRating());
                er.setComment(eventRatingDto.getComment());
                eventRatingRepository.save(er);
                return new ResponseDto<>(true, "Calificación del evento actualizada exitosamente", toDto(er));
            } else {
                return new ResponseDto<>(false, "Calificación del evento no encontrada");
            }
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error actualizando la calificación del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<List<EventRatingDto>> getEventRatingByEvent(EventRatingDto eventRatingDto) {
        try {
            Event event = eventRepository.findById(eventRatingDto.getEventId())
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            List<EventRating> eventRatings = eventRatingRepository.findAllByEventId(event);
            List<EventRatingDto> eventRatingDtos = eventRatings.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
            return new ResponseDto<>(true, "Calificaciones del evento encontradas", eventRatingDtos);
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo las calificaciones del evento: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<EventRatingDto> getEventRatingByUser(EventRatingDto eventRatingDto) {
        try {
            User user = userRepository.findById(eventRatingDto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            if (!user.isActivated()) {
                throw new RuntimeException("Cuenta no activada.");
            }
            Optional<EventRating> eventRating = eventRatingRepository.findByUserId(user);
            if (eventRating.isPresent()) {
                return new ResponseDto<>(true, "Calificación del evento encontrada", toDto(eventRating.get()));
            } else {
                return new ResponseDto<>(false, "Calificación del evento no encontrada");
            }
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo la calificación del evento: " + e.getMessage());
        }
    }
}