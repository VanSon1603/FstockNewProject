package com.example.Fstock.responsitory;

import com.example.Fstock.entity.Order;
import com.example.Fstock.entity.Order_Item;
import com.example.Fstock.entity.Product;
import com.example.Fstock.enums.OrderStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public interface OrderRepository extends JpaRepository<Order, Integer>, JpaSpecificationExecutor<Order> {
    Page<Order> findByOrderStatus(OrderStatus orderStatus, Pageable pageable);
    Page<Order> findByOrderIdAndOrderStatus(Integer orderId, OrderStatus orderStatus, Pageable pageable);

    @Query("""
                SELECT o
                FROM Order o
                WHERE o.email = :email
                  ORDER BY o.orderDate DESC
            """)
    List<Order> findByEmail(String email);

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "order")
    @Query("""
                SELECT COUNT(o) > 0
                FROM Order o
                JOIN o.orderItems oi
                WHERE o.user.userId = :userId
                  AND oi.product.productId = :productId
                  AND o.orderStatus = 'COMPLETED'
                  AND o.orderDate <= :validDate
            """)
    Boolean checkUserOrdered(int userId, int productId, LocalDateTime validDate);
}
