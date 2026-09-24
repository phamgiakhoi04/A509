package com.A509.Repository;

import com.A509.Entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop10ByActionInOrderByCreatedAtDesc(
            List<String> actions
    );
}