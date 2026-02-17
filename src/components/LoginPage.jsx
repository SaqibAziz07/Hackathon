import React, { useState, useRef } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }

    setLoading(false);
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });

      setIsLogin(true);
    } catch (err) {
      setError("Error in creating account");
    }

    setLoading(false);
  };

  const styles = {
    container: {
      width: "100%",
      maxWidth: "420px",
      padding: "20px",
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    formCard: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "40px",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      width: "100%",
    },
    header: {
      textAlign: "center",
      marginBottom: "32px",
    },
    headerH1: {
      fontFamily: "'Instrument Serif', serif",
      fontSize: "2.2rem",
      letterSpacing: "0.04em",
      fontWeight: 700,
      color: "#4f46e5",
      marginBottom: "8px",
      textShadow: "0 0 8px rgba(79, 70, 229, 0.3), 0 0 16px rgba(79, 70, 229, 0.25)",
    },
    headerP: {
      color: "#64748b",
      fontSize: "0.95rem",
    },
    inputGroup: {
      position: "relative",
      marginBottom: "24px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1.5px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "1rem",
      background: "transparent",
      transition: "all 0.2s ease",
      outline: "none",
      boxSizing: "border-box",
    },
    inputFocused: {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.1)",
    },
    label: {
      position: "absolute",
      left: "16px",
      top: "12px",
      color: "#64748b",
      pointerEvents: "none",
      transition: "all 0.2s ease",
      background: "white",
      padding: "0 4px",
      fontSize: "1rem",
    },
    labelActive: {
      top: "-10px",
      fontSize: "0.8rem",
      color: "#4f46e5",
      fontWeight: 600,
    },
    primaryBtn: {
      fontFamily: "'Instrument Serif', sans-serif",
      letterSpacing: "0.06em",
      width: "100%",
      padding: "14px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    footerText: {
      marginTop: "24px",
      textAlign: "center",
      fontSize: "0.9rem",
      color: "#64748b",
    },
    toggleLink: {
      color: "#4f46e5",
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      marginLeft: "4px",
    },
    alert: {
      padding: "12px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      marginBottom: "20px",
      textAlign: "center",
    },
    alertSuccess: {
      color: "#16a34a",
      background: "rgba(22, 163, 74, 0.1)",
      border: "1px solid rgba(22, 163, 74, 0.2)",
    },
    alertError: {
      color: "#dc2626",
      background: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.2)",
    },
  };

  const renderInput = (type, name, placeholder, required = true) => {
    const isFocused = focusedInput === name;
    const hasValue = formData[name] && formData[name].length > 0;

    return (
      <div style={styles.inputGroup}>
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          required={required}
          style={{
            ...styles.input,
            ...(isFocused ? styles.inputFocused : {}),
          }}
          onFocus={() => setFocusedInput(name)}
          onBlur={() => setFocusedInput(null)}
        />
        <label style={{
          ...styles.label,
          ...(isFocused || hasValue ? styles.labelActive : {}),
        }}>
          {placeholder}
        </label>
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "'Instrument Sans', sans-serif",
      background: "linear-gradient(135deg, #a2add4 0%, #f8fafc 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "#4f46e5",
        filter: "blur(120px)",
        opacity: 0.15,
        zIndex: -1,
        top: "-100px",
        right: "-100px",
      }} />
      
      <div style={styles.container}>
        <div style={styles.formCard}>
          <div style={styles.header}>
            <h1 style={styles.headerH1}>
              {isLogin ? "Login" : "Register"}
            </h1>
            <p style={styles.headerP}>
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          {error && (
            <div style={{...styles.alert, ...styles.alertError}}>
              {error}
            </div>
          )}
          {loading && (
            <div style={{...styles.alert, ...styles.alertSuccess}}>
              Processing...
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {!isLogin && renderInput("text", "username", "Full Name")}

            {renderInput("email", "email", "Email")}

            {renderInput("password", "password", "Password")}

            {!isLogin && renderInput("password", "confirmPassword", "Confirm Password")}

            <button
              type="submit"
              style={styles.primaryBtn}
              onMouseEnter={(e) => {
                e.target.style.background = "#4338ca";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#4f46e5";
                e.target.style.transform = "translateY(0)";
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p style={styles.footerText}>
            {isLogin ? "New here?" : "Already have account?"}
            <span
              style={styles.toggleLink}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
            >
              {isLogin ? "Create account" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;