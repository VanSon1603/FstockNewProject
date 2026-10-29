import api from "../api/api";

export const loginAuth = (data) => {
    return api.post(`/auth/token`, { 
        email: data.email, 
        password: data.password
    });
};

export const registerApi = (data) => {
    return api.post(`/users`, { 
        firstName: data.firstName, 
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        userName: data.userName,
        email: data.email,
        password: data.password

    });
}
export const logoutApi = (data) => {
    return api.post(`/auth/logout`, {
        token: data
    });
}
export const introspectToken = (token) => {
    return api.post(`/auth/introspect`, token);
}
export const loginWithGoogle = (code, redirectUri, codeVerifier) => {
    return api.post(`/auth/login-google`, {
        authorizeCode : code,
        redirectUri : redirectUri,
        codeVerifier: codeVerifier
    });
}
