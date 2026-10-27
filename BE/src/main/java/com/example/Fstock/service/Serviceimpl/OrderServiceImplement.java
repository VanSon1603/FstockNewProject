package com.example.Fstock.service.Serviceimpl;

import com.example.Fstock.dto.request.CreateOrderRequest;
import com.example.Fstock.dto.response.OrderDto;
import com.example.Fstock.entity.Order;
import com.example.Fstock.entity.Order_Item;
import com.example.Fstock.entity.Product;
import com.example.Fstock.entity.User;
import com.example.Fstock.enums.OrderStatus;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.mapper.OrderMapper;
import com.example.Fstock.responsitory.OrderRepository;
import com.example.Fstock.responsitory.ProductRepository;
import com.example.Fstock.responsitory.UserRepository;
import com.example.Fstock.responsitory.specification.OrderSpecification;
import com.example.Fstock.service.Service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class OrderServiceImplement implements OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private OrderMapper orderMapper;

    @Override
    public void createOrder(CreateOrderRequest createOrderRequest) {
        Optional<User> user = (userRepository.findByEmail(createOrderRequest.getEmail()));
        if (user.isEmpty()) {
            throw new NotFoundException("User not found");
        }

        // Create order entity and set properties
        Order order = new Order();
        if (orderRepository.findById(createOrderRequest.getOrderId()).isPresent()) {
            throw new NotFoundException("Order already exists");
        }
        order.setOrderId(createOrderRequest.getOrderId());
        order.setUser(user.get());
        order.setEmail(createOrderRequest.getEmail());
        order.setOrderDate(LocalDateTime.now());
        order.setPhoneNumber(createOrderRequest.getPhoneNumber());
        order.setShippingAddress(createOrderRequest.getProvinceName() + "/ " +
                createOrderRequest.getDistrictName() + "/ " +
                createOrderRequest.getWardName() + "/ " +
                createOrderRequest.getSpecificAddress());
        order.setRecipientName(createOrderRequest.getRecipientName());
        order.setPaymentMethod(createOrderRequest.getPaymentMethod());
        order.setOrderStatus(createOrderRequest.getOrderStatus());
        order.setNote(createOrderRequest.getNote());
        order.setTotalPrice(createOrderRequest.getTotalPrice());
        List<Order_Item> orderItems = new ArrayList<>();
        createOrderRequest.getOrderItems().forEach(orderItemDto -> {
            Order_Item orderItem = new Order_Item();
            Product product = productRepository.findByProductId(orderItemDto.getProductId());
            if (product == null) {
                throw new NotFoundException("Product not found");
            }
            orderItem.setImageUrlDisplay(product.getImageUrlDisplay());
            orderItem.setProduct(product);
            orderItem.setQuantity(orderItemDto.getQuantity());
            orderItem.setPriceAtOrder(orderItemDto.getPriceAtOrder());
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        });
        order.setOrderItems(orderItems);
        // Save order to the database
        orderRepository.save(order);
    }
    @Override
    public void updateOrderStatus(String orderId, String orderStatus) {
        Optional<Order> order = orderRepository.findById(Integer.parseInt(orderId));
        if (order.isEmpty()) {
            throw new NotFoundException("Order not found");
        }
        Order existingOrder = order.get();
        existingOrder.setOrderStatus(OrderStatus.valueOf(orderStatus));
        orderRepository.save(existingOrder);
    }

    @Override
    public void deleteOrders(List<Integer> orderIds) {
        for (Integer id : orderIds) {
            Optional<Order> order = orderRepository.findById(id);
            if (order.isEmpty()) {
                throw new NotFoundException("Order not found");
            }
            orderRepository.delete(order.get());
        }
    }

    @Override
    public void deleteOrderById(Integer orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isEmpty()) {
            throw new NotFoundException("Order not found");
        }
        orderRepository.delete(order.get());
    }

    @Override
    public OrderDto getOrderById(Integer orderId) {
        return orderRepository.findById(orderId)
                .map(orderMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Order not found"));
    }

    @Override
    public Page<OrderDto> getListNewOrders(int pageNumber, int pageSize, int keySearch) {
        if (keySearch != 0 ) {
            Pageable pageable = PageRequest.of(pageNumber-1, pageSize);
            Page<Order> orders = orderRepository.findByOrderIdAndOrderStatus(keySearch, OrderStatus.PENDING, pageable);
            Page<OrderDto> orderDtos = orders.map(order -> orderMapper.toDto(order));
            return orderDtos;
        }
        Pageable pageable = PageRequest.of(pageNumber-1, pageSize, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findByOrderStatus(OrderStatus.PENDING, pageable);
        Page<OrderDto> orderDtos = orders.map(order -> orderMapper.toDto(order));
        return orderDtos;
    }
    @Override
    public Page<OrderDto> getAllOrders(int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber-1, pageSize, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findAll(pageable);
        Page<OrderDto> orderDtos = orders.map(order -> orderMapper.toDto(order));
        return orderDtos;
    }

    @Override
    public List<OrderDto> getOrdersByEmail(String email) {
        List<OrderDto> orderDtos = new ArrayList<>();
        List<Order> orders = orderRepository.findByEmail(email);
        for (Order order : orders) {
            OrderDto orderDto = orderMapper.toDto(order);
            orderDtos.add(orderDto);
        }
        log.info("Order dtos: {}", orderDtos);
        return orderDtos;
    }

    @Override
    public Page<OrderDto> getOrderByCondition(int pageNumber, int pageSize, String status, Integer orderId, LocalDate startDate, LocalDate endDate, boolean sortByDateInc) {
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize, Sort.by("orderDate").descending());
        if (sortByDateInc == true){
            pageable = PageRequest.of(pageNumber - 1, pageSize, Sort.by("orderDate").ascending());
        }

        Specification<Order> specification = Specification.where(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.hasOrderId(orderId))
                .and(OrderSpecification.fromDate(startDate))
                .and(OrderSpecification.toDate(endDate));

            Page<Order> orders = orderRepository.findAll(specification, pageable);
        Page<OrderDto> orderDtos = orders.map(order -> orderMapper.toDto(order));
        return orderDtos;
    }
}
