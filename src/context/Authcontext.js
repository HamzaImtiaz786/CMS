import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ToastContext from "./ToastContext"; // Assuming you have this context set up for toast notifications
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const { toast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUserLoggedIn(); // Check user logged-in status on initial load
  }, []);

  // Check if the user is already logged in.
  const checkUserLoggedIn = async () => {
    try {
      const res = await fetch(`http://localhost:8001/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await res.json();

      console.log("Check User Logged In Result:", result); // Debugging

      if (!result.error) {
        if (
          location.pathname === "/api/login" ||
          location.pathname === "/api/register"
        ) {
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
        } else {
          navigate(location.pathname ? location.pathname : "/");
        }
        setUser(result);
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Error checking user login status:", err);
    }
  };

  // Login request to authenticate the user.
  const loginUser = async (userData) => {
    try {
      const res = await fetch(`http://localhost:8001/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Response object from login API:", res); // Added for debugging

      const result = await res.json();

      console.log("Parsed result from login API:", result); // Added for debugging

      if (!result.error) {
        console.log("Token received from login:", result.token); // Ensure token is received

        localStorage.setItem("token", result.token);
        setUser(result.user);
        // toast.success(`Logged in as ${result.user.name}`);

        navigate("/create", { replace: true });
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during login request:", err);
      toast.error("An error occurred during login. Please try again later.");
    }
  };

  // Register request to create a new user.
  const registerUser = async (userData) => {
    try {
      const res = await fetch(`http://localhost:8001/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await res.json();

      console.log("Register result:", result); // Debugging registration

      if (!result.error) {
        toast.success("User registered successfully! Please log in.");
        navigate("/login", { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Error during registration request:", err);
      toast.error("An error occurred during registration. Please try again later.");
    }
  };

  return (
    <AuthContext.Provider value={{ loginUser, registerUser, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
