package com.umkm.repository;

import com.umkm.entity.Order;
import com.umkm.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    long countBySellerIdAndStatus(Long sellerId, OrderStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Order o WHERE o.status IN :statuses AND o.createdAt < :limit")
    void deleteByStatusInAndCreatedAtBefore(List<OrderStatus> statuses, java.time.LocalDateTime limit);
}
