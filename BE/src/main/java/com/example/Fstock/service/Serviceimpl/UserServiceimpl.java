package com.example.Fstock.service.Serviceimpl;

import com.cloudinary.Cloudinary;
import com.example.Fstock.dto.request.ChangeInfoRequest;
import com.example.Fstock.dto.request.ChangePasswordRequest;
import com.example.Fstock.dto.request.ChangeRolesRequest;
import com.example.Fstock.dto.request.CreationUser;
import com.example.Fstock.dto.response.OrderDto;
import com.example.Fstock.dto.response.UserResponse;
import com.example.Fstock.entity.Order;
import com.example.Fstock.entity.Roles;
import com.example.Fstock.entity.User;
import com.example.Fstock.entity.User_Roles;
import com.example.Fstock.enums.AccountType;
import com.example.Fstock.enums.Gender;
import com.example.Fstock.exception.BadRequestException;
import com.example.Fstock.exception.ConflictException;
import com.example.Fstock.exception.InternalServerErrorException;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.mapper.UserMapper;
import com.example.Fstock.responsitory.RolesRepository;
import com.example.Fstock.responsitory.UserRepository;
import com.example.Fstock.responsitory.User_RoleRepository;
import com.example.Fstock.service.Service.AuthenticationService;
import com.example.Fstock.service.Service.UserService;
import com.example.Fstock.ultis.CloudinaryUltis;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.management.relation.Role;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceimpl implements UserService {
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RolesRepository rolesRepository;
    @Autowired
    private CloudinaryUltis cloudinaryUltis;
    @Autowired
    private Cloudinary cloudinary;
    @Value("${avatar.default}")
    private String avatarDefault;


    @Override
    @Transactional
    public void createUser(CreationUser creationUser) {
        User newUser = new User();
        if(userRepository.existsByUserName(creationUser.getUserName())) {
            throw new ConflictException("User name already exists");
        }
        if(userRepository.existsByEmail(creationUser.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        newUser.setFirstName(creationUser.getFirstName());
        newUser.setLastName(creationUser.getLastName());
        newUser.setEmail(creationUser.getEmail());
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        newUser.setPassword(passwordEncoder.encode(creationUser.getPassword()));
        newUser.setPhone(creationUser.getPhone());
        newUser.setUserName(creationUser.getUserName());
        newUser.setImgUrlDisplay(avatarDefault);
        newUser.setActive(false);
        newUser.setAccountType(AccountType.LOCAL);
        if (creationUser.getGender() != null) {
            newUser.setGender(creationUser.getGender());
        }else {
            newUser.setGender(Gender.OTHER);
        }

        User savedUser = userRepository.save(newUser);
        if(savedUser == null) {
            throw new InternalServerErrorException("create user failed");
        }
        // handle Role for new user
        List<User_Roles> userRolesList = new ArrayList<>();
        if (creationUser.getRoles() == null || creationUser.getRoles().isEmpty()) {

            User_Roles userRoles = new User_Roles();
            userRoles.setUser(savedUser);
            Roles role = rolesRepository.findByRoleName("USER")
                    .orElseThrow(() -> new NotFoundException("Role not found"));
            userRoles.setRoles(role);
            userRolesList.add(userRoles);
        } else {
            creationUser.getRoles().forEach((role) -> {
                User_Roles userRoles = new User_Roles();
                userRoles.setUser(savedUser);
                userRoles.setRoles(role);
                userRolesList.add(userRoles);
            });
        }
        savedUser.setUserRoles(userRolesList);
        userRepository.save(savedUser);

        // Send email for verification
        authenticationService.sendEmailForVerification(savedUser);

    }

    @Override
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));

        return userMapper.toUserResponse(user);
    }


    @Override
    public UserResponse getUserById(int userId) {
       User user =  userRepository.findByUserId(userId);
       return userMapper.toUserResponse(user);
    }


    @Override
    public Page<UserResponse> getAllUser(int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber-1, pageSize);
        Page<User> users = userRepository.findAll(pageable);
        Page<UserResponse> orderDtos = users.map(user -> userMapper.toUserResponse(user));
        return orderDtos;
    }

    @Override
    public void changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByEmail(changePasswordRequest.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())){
            throw new BadRequestException("Old password is incorrect");
        }
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

    }

    @Override
    public void changeInfo(ChangeInfoRequest changeInfoRequest) throws IOException {
        User user = userRepository.findByEmail(changeInfoRequest.getEmail())
                .orElseThrow(() ->  new NotFoundException("User not found"));
        if (changeInfoRequest.getImgUrlDisplay() != null) {
            user.setImgUrlDisplay(cloudinaryUltis.getImageUrlAfterUpload(changeInfoRequest.getImgUrlDisplay()));
        }
        user.setUserName(changeInfoRequest.getUserName());
        user.setPhone(changeInfoRequest.getPhone());
        userRepository.save(user);
    }

    @Override
    public void changeActiveStatus(String email, Boolean activeStatus) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setActive(activeStatus);
        userRepository.save(user);
    }

    @Override
    public void changeRoles(ChangeRolesRequest changeRolesRequest) {
        User user = userRepository.findByEmail(changeRolesRequest.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Roles> roles = changeRolesRequest.getRoleNames().stream().map(name -> rolesRepository.findByRoleName(name)
                .orElseThrow(() -> new NotFoundException("Role not found")))
                .collect(Collectors.toList());

        List<User_Roles> userRoles = user.getUserRoles();
        userRoles.clear();
        roles.forEach(role -> {
            User_Roles userRole = new User_Roles();
            userRole.setUser(user);
            userRole.setRoles(role);
            userRoles.add(userRole);
        });
        user.setUserRoles(userRoles);
        userRepository.save(user);
    }
    @Override
    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        userRepository.delete(user);
    }


}
