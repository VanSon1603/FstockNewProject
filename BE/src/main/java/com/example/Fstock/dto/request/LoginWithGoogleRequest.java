package com.example.Fstock.dto.request;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LoginWithGoogleRequest {
    private String authorizeCode;
    private String codeVerifier;
    private String redirectUri;
}
