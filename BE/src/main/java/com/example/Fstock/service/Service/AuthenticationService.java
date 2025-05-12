package com.example.Fstock.service.Service;

import com.example.Fstock.dto.request.*;
import com.example.Fstock.dto.response.AuthenticationResponse;
import com.example.Fstock.dto.response.IntrospectResponse;
import com.example.Fstock.entity.User;
import com.nimbusds.jose.JOSEException;


import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest);
    IntrospectResponse introspectResponse(IntrospectRequest introspectRequest) throws JOSEException, ParseException;
    AuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest) throws ParseException, JOSEException;
    void logout(LogoutRequest logoutRequest) throws ParseException, JOSEException;
    AuthenticationResponse loginWithGoogle(LoginWithGoogleRequest loginWithGoogleRequest) throws ParseException, JOSEException ;
    void sendEmailForVerification(User user);
    boolean verifyEmail(String token) throws ParseException, JOSEException;
}

