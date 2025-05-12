package com.example.Fstock.controller;

import com.example.Fstock.dto.request.ChangeInfoRequest;
import com.example.Fstock.dto.request.ChangePasswordRequest;
import com.example.Fstock.dto.request.ChangeRolesRequest;
import com.example.Fstock.dto.request.CreationUser;
import com.example.Fstock.dto.response.ApiResponse;
import com.example.Fstock.dto.response.UserResponse;
import com.example.Fstock.responsitory.UserRepository;
import com.example.Fstock.service.Service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping()
    public ResponseEntity<ApiResponse> createUser(@RequestBody @Valid CreationUser user) {
        userService.createUser(user);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("User Created, please check your email to verify")
                .build());

    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable int id) {
        UserResponse userResponse = userService.getUserById(id);
        return  ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .message("User by id")
                .data(userResponse)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMyInfo() {
        UserResponse userResponse = userService.getMyInfo();
        return  ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .message("My info")
                .data(userResponse)
                .build());
    }
    @GetMapping()
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return  ResponseEntity.ok(ApiResponse.<Page<UserResponse>>builder()
                .message("All users")
                .data(userService.getAllUser(pageNumber, pageSize))
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@RequestBody @Valid ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Change password success")
                .build());
    }

    @PutMapping(value = "/change-info", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse> changeInfo(@ModelAttribute @Valid ChangeInfoRequest changeInfoRequest) throws IOException {
        userService.changeInfo(changeInfoRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Change info success")
                .build());
    }

    @PutMapping(value = "/change-active-status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> changeActiveStatus(@RequestParam("email") String email,
                                                          @RequestParam("status") Boolean activeStatus){
        userService.changeActiveStatus(email, activeStatus);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Change info success")
                .build());
    }
    @PutMapping(value = "/change-roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> changeRoles(@RequestBody ChangeRolesRequest changeRolesRequest) {
        userService.changeRoles(changeRolesRequest);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Change role success")
                .build());
    }

    @DeleteMapping(value = "/delete/{email}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> changeRoles(@PathVariable String email) {
        userService.deleteUser(email);
        return ResponseEntity.ok(ApiResponse.builder()
                .message("Change role success")
                .build());
    }






}
