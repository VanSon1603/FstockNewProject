import {  useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../components/user/Loading";
import { useContext, useEffect } from "react";
import { loginWithGoogle } from "../service/AuthService";
import AuthContext from "../contexts/AuthContext";
import { ToastContext } from "../contexts/ToastContext";

const LoginCallBackGooglePage = () => {
  const { login } = useContext(AuthContext);
  const {toast} = useContext(ToastContext);
  const [searchParams] = useSearchParams();
  const navigator = useNavigate();
  console.log(searchParams.get("code"));
  useEffect(() => {
    const handleCallBack = async () => {
      try {
        const code = searchParams.get("code");
        const storedCodeVerifier = localStorage.getItem("code_verifier");
        const redirectUri = import.meta.env.VITE_GOOGLE_LOGIN_REDIRECT_URL;
        if (!code) {
          throw new Error("Không tìm thấy mã ủy quyền.");
        }
        if (!storedCodeVerifier) {
          throw new Error("Không tìm thấy code verifier.");
        }
        const res = await loginWithGoogle(code, redirectUri, storedCodeVerifier);
        if (res.status === 200) {
          login(res.data.data.token);
          navigator("/");
        } else {
          throw new Error("Đăng nhập không thành công.");
        }
      } catch {
        navigator("/login");
        localStorage.removeItem("code_verifier");
        toast.error("Đăng nhập không thành công.");
      }
    };
    handleCallBack();
  }, []);

  return <Loading></Loading>;
};
export default LoginCallBackGooglePage;
