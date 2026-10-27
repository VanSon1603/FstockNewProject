package com.example.Fstock.controller;


import com.example.Fstock.dto.request.CreateOrderRequest;
import com.example.Fstock.dto.response.ApiResponse;
import com.example.Fstock.dto.response.OrderDto;
import com.example.Fstock.enums.OrderStatus;
import com.example.Fstock.service.Service.OrderService;
import com.example.Fstock.service.Service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private PaymentService paymentService;



    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable("orderId") Integer orderId) {
        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .message("get order successfully")
                .data(orderService.getOrderById(orderId))
                .build());
    }

    @GetMapping("/create-payment")
    public ResponseEntity<ApiResponse> createPayment(HttpServletRequest request) throws UnsupportedEncodingException, NoSuchAlgorithmException, InvalidKeyException {

        return ResponseEntity.ok(ApiResponse.builder()
                .message("Create order successfully")
                .data(paymentService.createOrderVNPAY(request))
                .build());
    }

    @GetMapping("/vn-pay-callback")
    public RedirectView payCallbackHandler(HttpServletResponse response,
                                           @RequestParam("vnp_ResponseCode") String status,
                                           @RequestParam("vnp_TxnRef") String orderId)
    {
        RedirectView redirectView = new RedirectView();
        if (status.equals("00")) {
            redirectView.setUrl("http://localhost:5173/checkout/success");
            orderService.updateOrderStatus(orderId, "PAID");
        } else {
            redirectView.setUrl("http://localhost:5173/checkout/error/id=" + orderId);
        }
        return redirectView;
    }

    @GetMapping("/new-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getListNewOrders(
            @RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "keySearch", defaultValue = "0") int keySearch) {
        return ResponseEntity.ok(ApiResponse.<Page<OrderDto>>builder()
                .message("List new orders")
                .data(orderService.getListNewOrders( pageNumber, pageSize, keySearch))
                .build());
    }
    @GetMapping("/all-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllOrders(
            @RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize)
            {
        return ResponseEntity.ok(ApiResponse.<Page<OrderDto>>builder()
                .message("List all orders")
                .data(orderService.getAllOrders( pageNumber, pageSize))
                .build());
    }
    @GetMapping("/orders-condition")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getOrdersByCondition(
            @RequestParam(value = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "status", defaultValue = "", required = false) String status,
            @RequestParam(value = "orderId", defaultValue = "", required = false) Integer orderId,
            @RequestParam(value = "startDate", defaultValue = "", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", defaultValue = "", required = false) LocalDate endDate,
            @RequestParam(value = "sortByDateInc", defaultValue = "false", required = false) boolean sortByDateInc) {
    {
        return ResponseEntity.ok(ApiResponse.<Page<OrderDto>>builder()
                .message("Order with condition")
                .data(orderService.getOrderByCondition( pageNumber, pageSize, status, orderId, startDate, endDate, sortByDateInc))
                .build());
    }
    }

    @GetMapping()
    public ResponseEntity<ApiResponse> getOrdersByEmail(@RequestParam("email") String email){

        return ResponseEntity.ok(ApiResponse.<List<OrderDto>>builder()
                .message("Create order successfully")
                .data(orderService.getOrdersByEmail(email))
                .build());
    }
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse> createOrder(@RequestBody CreateOrderRequest createOrderRequest){
        orderService.createOrder(createOrderRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Create order successfully")
                .build());
    }
    @PutMapping("/update-order-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @RequestParam(value = "orderId") String orderId,
            @RequestParam(value = "status") String status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Update order status successfully")
                .build());
    }
    @DeleteMapping("/delete-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteOrders(@RequestBody List<Integer> orderIds) {
       orderService.deleteOrders(orderIds);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Delete list order successfully")
                .build());
    }
    @DeleteMapping("/delete-order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteOrders(@PathVariable Integer orderId) {
        orderService.deleteOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Delete order successfully")
                .build());
    }

}
