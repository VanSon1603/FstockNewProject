import { useContext, useState } from "react";
import { loginAuth } from "../service/AuthService";
import AuthContext from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Banner from "../components/user/Banner";
import { ToastContext } from "../contexts/ToastContext";
import CryptoJS from "crypto-js";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigator = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginOptions = {
    email: {
      required: "email must not be blank",
    },
    password: {
      required: "password must not be blank",
    },
  };

  const handleNavigateRegister = () => {
    navigator("/register");
  };
  const onSubmit = async (data) => {
    try {
      const response = await loginAuth(data);
      await login(response.data.data.token);
      if (localStorage.getItem("authToken")) {
        navigator(-1);
        toast.success("Login successful");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  //login with google (PKCE)

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  const generateCodeChallenge = (codeVerifier) => {
    const hashed = CryptoJS.SHA256(codeVerifier);
    return CryptoJS.enc.Base64.stringify(hashed)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };
  const handleLoginWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_LOGIN_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_LOGIN_REDIRECT_URL;
    const responseType = import.meta.env.VITE_GOOGLE_LOGIN_RESPONSE_TYPE;
    const scope = import.meta.env.VITE_GOOGLE_LOGIN_SCOPE;

    setError(null);
    try {
      const codeVerifier = generateCodeVerifier();
      localStorage.setItem("code_verifier", codeVerifier);
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      window.location.href = authUrl;
    } catch {
      setError("Không thể khởi tạo đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Banner pageName={"Login"}></Banner>
      <section className="login-area pt-100 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="basic-login">
                <h3 className="text-center mb-60">Login From Here</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <label>
                    Email Address <span>**</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Email address..."
                    {...register("email", loginOptions.email)}
                  />
                  {errors.email && (
                    <div style={{ color: "red" }}>{errors.email.message}</div>
                  )}
                  <label>
                    Password <span>**</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    {...register("password", loginOptions.password)}
                  />
                  {errors.password && (
                    <div style={{ color: "red" }}>
                      {errors.password.message}
                    </div>
                  )}
                  <div className="login-action mb-20 fix">
                    <span className="log-rem f-left">
                      <input id="remember" type="checkbox" />
                      <label>Remember me!</label>
                    </span>
                    <span className="forgot-login f-right">
                      <a href="#">Lost your password?</a>
                    </span>
                  </div>
                  <button className="os-btn w-100" type="submit">
                    Login Now
                  </button>
                  <div className="or-divide">
                    <span>or</span>
                  </div>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <button
                    className="os-btn w-100 mb-10"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLoginWithGoogle();
                    }}
                    style={{ background: "#DD0000", color: "white" }}
                    disabled={loading}
                  >
                    Sign in with Google
                  </button>
                  <a
                    className="os-btn os-btn-black w-100"
                    onClick={handleNavigateRegister}
                  >
                    Register Now
                  </a>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default LoginPage;
