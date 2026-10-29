import { jwtDecode } from "jwt-decode";
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    if (localStorage.getItem("code_verifier")) {
      localStorage.removeItem("code_verifier");
    }
    setUser(null);
  };

  const isTokenExpired = async (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      console.error("Invalid token:", error);
      return true;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        const result = await isTokenExpired(token);
        if (result) {
          logout();
        }
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.active === false) {
        logout();
        console.log("Tài khoản của bạn bị khóa");
      }
    }
  }, []);
  //loading biến đổi trạng thái loading, khi loading = true thì hiển thị loading spinner, khi loading = false thì hiển thị children
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
