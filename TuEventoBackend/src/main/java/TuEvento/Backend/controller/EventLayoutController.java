package TuEvento.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import TuEvento.Backend.dto.EventLayoutDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.EventLayoutService;

@RestController
@RequestMapping("/api/v1/eventLayout")
public class EventLayoutController {
    @Autowired
    private EventLayoutService eventLayoutService;
    @PostMapping("/insert")
        public ResponseDto<EventLayoutDto> Event(@RequestBody EventLayoutDto EventLayoutDto) {
        return eventLayoutService.createEventLayout(EventLayoutDto);
    }
    @PutMapping("/update")
    public ResponseDto<EventLayoutDto> updateEvent(@RequestBody String name,@RequestBody EventLayoutDto eventLayoutDto) {
        return eventLayoutService.updateEventLayout(name,eventLayoutDto);
    }
    @DeleteMapping("/delete")
    public ResponseDto<EventLayoutDto> deleteEvent(@RequestBody String name,EventLayoutDto eventLayoutDto) {
        return eventLayoutService.deleteEventLayout(name,eventLayoutDto);
    }
    @GetMapping("/get")
    public ResponseDto<EventLayoutDto> getEvent(@RequestBody String name,EventLayoutDto eventLayoutDto) {
        return eventLayoutService.getEventLayout(name,eventLayoutDto);
    }

}
