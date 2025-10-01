package TuEvento.Backend.repository;

import TuEvento.Backend.model.EventImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventImgRepository extends JpaRepository<EventImg, Integer> {
    List<EventImg> findByEventId(int eventId);
    List<EventImg> findAllByEventIdOrderByOrderAsc(int eventId);

    // Delete all images for a specific event
    @Modifying
    @Query("DELETE FROM EventImg e WHERE e.event.id = :eventId")
    void deleteByEventId(@Param("eventId") int eventId);
}