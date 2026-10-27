package com.example.Fstock.service.Service;

import com.example.Fstock.dto.request.CreateOrderRequest;
import com.example.Fstock.dto.response.OrderDto;
import com.example.Fstock.entity.Order;
import com.example.Fstock.enums.OrderStatus;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface OrderService {
    void createOrder (CreateOrderRequest createOrderRequest);
    void updateOrderStatus(String orderId, String status);
    void deleteOrders(List<Integer> orderIds);
    void deleteOrderById(Integer orderId);
    OrderDto getOrderById(Integer orderId);
    Page<OrderDto> getListNewOrders(int pageNumber, int pageSize, int keySearch);
    Page<OrderDto> getAllOrders(int pageNumber, int pageSize);
    List<OrderDto> getOrdersByEmail(String email);
    Page<OrderDto> getOrderByCondition(int pageNumber, int pageSize, String status, Integer orderId, LocalDate startDate, LocalDate endDate, boolean sortByDateInc);
    }
