package com.example.Fstock.responsitory.specification;

import com.example.Fstock.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class OrderSpecification {

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.equals("ALL") || status.trim().isEmpty()) return null;
            return cb.equal(root.get("orderStatus"), status);
        };
    }
    public static Specification<Order> hasOrderId(Integer orderId) {
        return (root, query, cb) -> {
            if(orderId == null) return null;
            int orderIdInt = orderId.intValue();
            return cb.equal(root.get("orderId"), orderIdInt);
        };
    }
    public static Specification<Order> hasEmail(String email) {
        return (root, query, cb) -> {
            if(email == null) return null;
            return cb.equal(root.get("email"), email);
        };
    }
    public static Specification<Order> fromDate(LocalDate fromDate) {
        return (root, query, cb) -> {
            if (fromDate == null) return null;
            return cb.greaterThanOrEqualTo(root.get("orderDate"), fromDate);
        };
    }

    public static Specification<Order> toDate(LocalDate toDate) {
        return (root, query, cb) -> {
            if (toDate == null) return null;
            return cb.lessThanOrEqualTo(root.get("orderDate"), toDate);
        };
    }

}
