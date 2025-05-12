package com.example.Fstock.controller;

import com.example.Fstock.dto.request.*;
import com.example.Fstock.dto.response.ApiResponse;
import com.example.Fstock.dto.response.AuthenticationResponse;
import com.example.Fstock.dto.response.IntrospectResponse;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.service.Service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    @Autowired
    private  AuthenticationService authenticationService;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse> login (
            @RequestBody AuthenticationRequest authenticationRequest)
    {
        AuthenticationResponse authenticationResponse = authenticationService.authenticate(authenticationRequest);

        return ResponseEntity.ok
                (ApiResponse.<AuthenticationResponse>builder()
                .message("success login")
                .data(authenticationResponse)
                .build()
        );

    }
    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse> introspect (
            @RequestBody IntrospectRequest introspectRequest) throws ParseException, JOSEException {

        return ResponseEntity.ok
                (ApiResponse.<IntrospectResponse>builder()
                            .message("Token is valid")
                        .data(authenticationService.introspectResponse(introspectRequest))
                        .build()
                );

    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken (
            @RequestBody RefreshTokenRequest refreshTokenRequest) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(refreshTokenRequest );

        return ResponseEntity.ok
                (ApiResponse.<AuthenticationResponse>builder()
                        .message("Token is valid")
                        .data(result)
                        .build()
                );

    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout (
            @RequestBody LogoutRequest logoutRequest) throws ParseException, JOSEException {
        authenticationService.logout(logoutRequest );
        return ResponseEntity.ok
                (ApiResponse.<AuthenticationResponse>builder()
                        .message("Logout success")
                        .build()
                );

    }
    @PostMapping("/login-google")
    public ResponseEntity<ApiResponse> callbackGoogle (@RequestBody LoginWithGoogleRequest loginWithGoogleRequest) throws ParseException, JOSEException {
        AuthenticationResponse authenticationResponse = authenticationService.loginWithGoogle(loginWithGoogleRequest);
        return ResponseEntity.ok
                (ApiResponse.<AuthenticationResponse>builder()
                        .data(authenticationResponse)
                        .message("Login success")
                        .build()
                );

    }

    @GetMapping("/verify-email")
    public RedirectView verifyEmail (@RequestParam("token") String token) throws ParseException, JOSEException {
        RedirectView redirectView = new RedirectView();
        boolean result = false;
        try {
            result = authenticationService.verifyEmail(token);
        } catch (ParseException | JOSEException | NotFoundException e) {
            redirectView.setUrl("http://localhost:5173/login?error=token_invalid");
            return redirectView;
        }
        if (result) {
            redirectView.setUrl("http://localhost:5173?verify-email=success");
        } else {
            redirectView.setUrl("http://localhost:5173/login?error=token_invalid");
        }
        return redirectView;
    }




}
