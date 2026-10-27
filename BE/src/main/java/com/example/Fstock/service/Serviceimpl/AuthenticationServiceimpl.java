package com.example.Fstock.service.Serviceimpl;

import com.example.Fstock.dto.request.*;
import com.example.Fstock.dto.response.AuthenticationResponse;
import com.example.Fstock.dto.response.IntrospectResponse;
import com.example.Fstock.entity.*;
import com.example.Fstock.enums.AccountType;
import com.example.Fstock.enums.Gender;
import com.example.Fstock.exception.BadRequestException;
import com.example.Fstock.exception.NotFoundException;
import com.example.Fstock.exception.UnAuthorizedException;
import com.example.Fstock.responsitory.*;
import com.example.Fstock.service.Service.AuthenticationService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
public class AuthenticationServiceimpl implements AuthenticationService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;
    @Autowired
    private VerificationTokenRepository verificationTokenRepository;
    @Autowired
    private RolesRepository rolesRepository;
    @Autowired
    private User_RoleRepository userRoleRepository;
    @Autowired
    private JavaMailSender javaMailSender;
    @Value("${jwt.secretKey}")
    protected String secretKey;

    @Value("${jwt.access-duration}")
    protected String accessTokenDuration; // thời gian tồn tại của token

    @Value("${jwt.refresh-duration}")
    protected String refreshTokenDuration; // thời gian refresh token


    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        User user = userRepository.findByEmail(authenticationRequest.getEmail()).orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getActive() == false) {
            throw new UnAuthorizedException("Account disabled");
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean authenticated = passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new UnAuthorizedException("Password and Email incorrect");
        }
        String token = generateJwtToken(user);

        return  AuthenticationResponse.builder()
                .token(token)
                .authenticated(authenticated)
                .build();


    }
    @Override
    public void logout(LogoutRequest logoutRequest)  throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(logoutRequest.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);

        } catch (UnAuthorizedException exception) {
            log.info("Token already expired");
        }

    }
    @Override
    public IntrospectResponse introspectResponse(IntrospectRequest  introspectRequest) throws JOSEException, ParseException {
        String token = introspectRequest.getToken();

        boolean isvalid = true;

        try {
            verifyToken(token , false);
        } catch (UnAuthorizedException e) {
            isvalid = false;
        }
        return IntrospectResponse
                .builder()
                .valid(isvalid)
                .build();
    }

    private String generateJwtToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS256);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("furniturestock.com")
                .issueTime(new Date())// thời gian phát hành token
                .expirationTime(new Date(
                        Instant.now().plus(Long.parseLong(accessTokenDuration) , ChronoUnit.SECONDS).toEpochMilli()
                ))// thời hạn tồn tại của token
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        log.info(accessTokenDuration);

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(secretKey.getBytes()));// kí token
            return jwsObject.serialize();

        } catch (JOSEException e) {
            log.error("cannot create token");
            throw new RuntimeException(e);
        }
    }


    @Override
    public AuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest) throws ParseException, JOSEException {
        var signedJWT = verifyToken(refreshTokenRequest.getToken() , true);
        var jit = signedJWT.getJWTClaimsSet().getJWTID();// get id token
        var expriryTime = signedJWT.getJWTClaimsSet().getExpirationTime();// get thời gian hết hạn token

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expriryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

        var email = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        String token = generateJwtToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }


    // verify token
    private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(secretKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(Long.parseLong(refreshTokenDuration), ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) {
            throw new UnAuthorizedException("Token này không hợp lệ hoặc đã hết hạn");
        }

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new UnAuthorizedException("Token này đã bị vô hiệu hóa");
        }
        return signedJWT;
    }


    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!user.getUserRoles().isEmpty()){
            user.getUserRoles().forEach(user_roles -> {
                stringJoiner.add("ROLE_" + user_roles.getRoles().getRoleName());
                user_roles.getRoles().getPermissions().forEach(permission -> {
                    stringJoiner.add(permission.getPermissionName());
                });
            });
        }
        return stringJoiner.toString();
    }
    @Override
    @Transactional
    //login with google request
    public AuthenticationResponse loginWithGoogle(LoginWithGoogleRequest loginWithGoogleRequest) throws ParseException, JOSEException {

        Dotenv dotenv = Dotenv.load();
        String clientId = dotenv.get("GOOGLE_CLIENT_ID");
        String clientSecret = dotenv.get("GOOGLE_CLIENT_SECRET");
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("code", loginWithGoogleRequest.getAuthorizeCode());
        body.add("redirect_uri", loginWithGoogleRequest.getRedirectUri());
        body.add("code_verifier", loginWithGoogleRequest.getCodeVerifier());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, httpHeaders);
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        RestTemplate restTemplate = new RestTemplate();
        Map response = restTemplate.postForObject(tokenEndpoint, request, Map.class);
        // Lấy ID token từ response
        String idTokenString = (String) response.get("id_token");
        if (idTokenString == null) {
            throw new UnAuthorizedException("Không nhận được ID token từ Google");
        }
        // Xác minh ID token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
        GoogleIdToken googleIdToken = null;
        try {
            googleIdToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        if (googleIdToken == null) {
            throw new UnAuthorizedException("Invalid Google ID token");
        }

        // Lấy thông tin người dùng từ ID token
        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail();
        String token = null;
        if (userRepository.existsByEmail(email)){
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            token = generateJwtToken(user);
        }else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setGender(Gender.OTHER);
            newUser.setFirstName((String) payload.get("given_name"));
            newUser.setLastName((String) payload.get("family_name"));
            newUser.setUserName((String) payload.get("name"));
            newUser.setActive(true);
            newUser.setAccountType(AccountType.SOCIAL);
            newUser.setImgUrlDisplay((String) payload.get("picture"));
            User savedUser = userRepository.save(newUser);
            if (savedUser == null) {
                throw new BadRequestException("Create user with google account failed");
            }
            if(savedUser != null) {
                if (savedUser.getUserRoles() == null) {
                    savedUser.setUserRoles(new ArrayList<>());
                }
                // Tạo và lưu User_Roles
                User_Roles userRoles = new User_Roles();
                userRoles.setUser(savedUser);
                Roles role = rolesRepository.findByRoleName("USER")
                        .orElseThrow(() -> new NotFoundException("Role not found"));
                userRoles.setRoles(role);
                userRoleRepository.save(userRoles);
                // Thêm userRoles vào danh sách của savedUser
                savedUser.getUserRoles().add(userRoles);

            }
            token = generateJwtToken(savedUser);
        }
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    @Override
    @Transactional
    public void sendEmailForVerification(User user){
        String token =  generateJwtToken(user);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationTokenRepository.save(verificationToken);

        // Gửi email xác thực đến người dùng
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("nvanson1611@gmail.com");
        message.setSubject("Xác thực tài khoản Outstock Furniture");
        message.setText("Vui lòng nhấp vào liên kết sau để xác thực tài khoản của bạn: " +
                "http://localhost:8080/api/auth/verify-email?token=" + token);
        javaMailSender.send(message);
    }
    @Override
    @Transactional
    public boolean verifyEmail(String token) throws ParseException, JOSEException {
        try{
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Verification token not found"));
        SignedJWT signedJWT = verifyToken(token, false);
        User user =userRepository.findByEmail(signedJWT.getJWTClaimsSet().getSubject())
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setActive(true);
        userRepository.save(user);
        verificationTokenRepository.deleteByToken(token);
        return true;
        }catch(Exception e) {
            return false;
        }

    }
}
