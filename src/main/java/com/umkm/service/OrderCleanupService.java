package com.umkm.service;

import com.umkm.entity.OrderStatus;
import com.umkm.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderCleanupService {

    private final OrderRepository orderRepository;

    public OrderCleanupService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Run every day at midnight: "0 0 0 * * ?"
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupOldOrders() {
        // Auto-delete orders created more than 7 days ago having status SELESAI or DIBATALKAN
        LocalDateTime limit = LocalDateTime.now().minusDays(7);
        orderRepository.deleteByStatusInAndCreatedAtBefore(
            List.of(OrderStatus.SELESAI, OrderStatus.DIBATALKAN),
            limit
        );
    }
}
