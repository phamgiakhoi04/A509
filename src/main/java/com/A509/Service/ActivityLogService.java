package com.A509.Service;

import com.A509.DTO.ActivityLogDTO;
import com.A509.Entity.ActivityLog;
import com.A509.Repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(
            ActivityLogRepository activityLogRepository
    ) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getLatestActivities() {

        return activityLogRepository
                .findTop10ByActionInOrderByCreatedAtDesc(
                        List.of(
                                "CREATE",
                                "UPDATE",
                                "ADD_IMAGE"
                        )
                )
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private ActivityLogDTO toDTO(ActivityLog log) {

        ActivityLogDTO dto = new ActivityLogDTO();

        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setDescription(log.getDescription());
        dto.setCreatedAt(log.getCreatedAt());

        if (log.getArticle() != null) {
            dto.setArticleId(log.getArticle().getId());
            dto.setArticleSlug(log.getArticle().getSlug());
            dto.setArticleTitle(log.getArticle().getTitle());
        }

        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getId());
            dto.setUsername(log.getUser().getUsername());
        }

        return dto;
    }
}
