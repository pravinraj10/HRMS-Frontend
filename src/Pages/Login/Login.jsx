import loginImg from "../../asset/image/loginImg.png";
import api from "../../api/api";
import "./Login.css";
import TextField from '@mui/material/TextField';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dtgLogoImg from "../../asset/image/dtgLogoImg.png";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import checkEmailImg from "../../asset/image/checkEmailImg.png"
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    //login page
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();
    //forget page
    const {
        register: registerForgetPassword,
        handleSubmit: handleForgetPasswordSubmit,
        reset: resetForgetPassword,
        formState: { errors: errorsForgetPassword }
    } = useForm();
    //reset password
    const {
        register: registerResetPassword,
        handleSubmit: handleSubmitResetPassword,
        reset: resetResetPassword,
        watch: watchResetPassword,
        formState: { errors: errorsResetPassword }
    } = useForm();
    //watch variables
    const password = watchResetPassword("password");

    //declaring variables
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [showPasswordResetConfirm, setShowPasswordResetConfirm] = useState(false);
    const [activePage, setActivePage] = useState('login');

  useEffect(() => {

    const params = new URLSearchParams(location.search);

    const page = params.get("page");

    const token = params.get("token");

    if (page === "resetPassword" && token) {
        setActivePage("resetPassword");
    }

}, [location]);

const onSubmit = async (data) => {
  try {

    const response = await api.post("/login", {
      username: data.email,
      password: data.password
    });

    console.log("Login Success:", response.data);

    // STORE TOKEN
    localStorage.setItem("token", response.data.token);

    // STORE ROLE & PERMISSIONS
    localStorage.setItem("role", response.data.roleName || "");
  localStorage.setItem(
  "permissions",
  response.data.sideMenu || "[]"
);

    // STORE USER DETAILS
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName: response.data.fullName,
        email: response.data.email,
        profilePhoto: response.data.profilePhoto,
      })
    );

    // REDIRECT
    navigate("/dashboard");

  } catch (error) {

    console.error(
      "Login Failed:",
      error.response?.data || error.message
    );

    alert("Invalid email or password");
  }
};
const fetchEmployees = async () => {
  try {
    const res = await api.get("/employee"); // 🔐 protected endpoint
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};
    const onSendEmail = async (data) => {

    try {

        await api.post("/login/forgot-password", {
            email: data.email
        });

        setActivePage("checkEmail");

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Failed to send reset email"
        );
    }
};
    const onCLickBackToLogin = (activePage) => {
        reset();
        resetForgetPassword();
        resetResetPassword();
        if (activePage === 'resetSuccessfully') {
            navigate('/login');
        }
        setActivePage('login');
    }
   const onCLickResetPassword = async (data) => {

    try {

        const params = new URLSearchParams(location.search);

        const token = params.get("token");

        await api.post("/login/reset-password", {
            token,
            password: data.password,
            confirmPassword: data.confirmedPassword
        });

        setActivePage("resetSuccessfully");

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Password reset failed"
        );
    }
};
    return (
        <div className="app-container overflow-hidden">
            <div className="row min-vh-100">
                <div className="col-lg-6 col-md-6 col-sm-12 d-flex justify-content-center align-items-center">
                    <div>
                        <div>
                            <img src={dtgLogoImg} alt="DTG-Logo" style={{ width: '55%' }} />
                        </div>
                        {activePage === 'login' &&
                            <div>
                                <div className="welcomeBackTxt mt-2">
                                    WELCOME BACK 👋🏻
                                </div>
                                <div className="continueTxt">Continue to your Account.</div>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mt-2">
                                        <TextField
                                            type="email"
                                            id="outlined-basic"
                                            label="Email"
                                            variant="outlined"
                                            className="w-100"
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, }}
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            {...register("email", {
                                                required: "Email is required"
                                            })}

                                        />
                                    </div>
                                    <div className="mt-3">
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            id="outlined-basic"
                                            label="Password"
                                            variant="outlined"
                                            className="w-100"
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, }}
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            {...register("password", {
                                                required: "Password is required"
                                            })}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className="text-end forgetTxt mt-2" onClick={() => setActivePage('forget')}>
                                        <a className="font-bold underline" style={{ color: 'black' }}>
                                            Forget Password?
                                        </a>
                                    </div>

                                    <div className="mt-2">
                                        <button type="submit" className="btn btn-primary w-100 loginBtn">Login <ArrowForwardIosIcon sx={{ fontSize: 13 }} /></button>
                                    </div>
                                    {/* <div className="mt-4 text-center" style={{ fontSize: '12px', color: '#757575', fontWeight: 500 }}>
                                        Are you a Newbie? <span style={{ color: '#000', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/signup')}>GET STARTED - IT'S FREE</span>
                                    </div> */}
                                </form>
                            </div>
                        }
                        {activePage === 'forget' &&
                            <div>
                                <div className="continueTxt">Forget Password</div>
                                <div className="welcomeBackTxt">
                                    Enter your email id to recieve a password reset link
                                </div>
                                <form onSubmit={handleForgetPasswordSubmit(onSendEmail)}>
                                    <div className="mt-2">
                                        <TextField
                                            type="email"
                                            id="outlined-basic"
                                            label="Email"
                                            variant="outlined"
                                            className="w-100"
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, }}
                                            error={!!errorsForgetPassword.email}
                                            helperText={errorsForgetPassword.email?.message}
                                            {...registerForgetPassword("email", {
                                                required: "Email is required"
                                            })}

                                        />
                                    </div>
                                    <div className="mt-2">
                                        <button type="submit" className="btn btn-primary w-100 loginBtn">Send Reset Link <ArrowForwardIosIcon sx={{ fontSize: 13 }} /></button>
                                    </div>
                                </form>
                                <div className="mt-5 text-center">
                                    <a href="/login" className="fw-bold underline" style={{ color: 'black' }}>
                                        Go Back To Login
                                    </a>
                                </div>
                            </div>
                        }
                        {activePage === 'checkEmail' &&
                            <div>
                                <div className="mt-4 text-center">
                                    <img src={checkEmailImg} alt="checkemail" />
                                    <div className="mt-3 continueTxt">Check Your Email</div>
                                    <div className="welcomeBackTxt">
                                        We've sent a Password reset link to your email address. Please check your <br />inbox and spam folder.
                                    </div>

                                </div>
                                <div className="mt-2">
                                    <button className="btn btn-primary w-100 loginBtn" onClick={onCLickBackToLogin}>Back to Login <ArrowForwardIosIcon sx={{ fontSize: 13 }} /></button>
                                </div>
                            </div>
                        }
                        {activePage === 'resetPassword' &&
                            <div>
                                <div className="mt-3 continueTxt">Create Your Password</div>
                                <div className="welcomeBackTxt">
                                    Create a new, Secure Password for you account.
                                </div>
                                <form onSubmit={handleSubmitResetPassword(onCLickResetPassword)}>
                                    <div className="mt-3">
                                        <TextField
                                            type={showPasswordReset ? "text" : "password"}
                                            id="outlined-basic"
                                            label="New Password"
                                            variant="outlined"
                                            className="w-100"
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, }}
                                            error={!!errorsResetPassword.password}
                                            helperText={errorsResetPassword.password?.message}
                                            {...registerResetPassword("password", {
                                                required: "Password is required"
                                            })}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPasswordReset(!showPasswordReset)}
                                                            edge="end"
                                                        >
                                                            {showPasswordReset ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <TextField
                                            type={showPasswordResetConfirm ? "text" : "password"}
                                            id="outlined-basic"
                                            label="Confirm Password"
                                            variant="outlined"
                                            className="w-100"
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, }}
                                            error={!!errorsResetPassword.confirmedPassword}
                                            helperText={errorsResetPassword.confirmedPassword?.message}
                                            {...registerResetPassword("confirmedPassword", {
                                                required: "Confirm Password is required",
                                                validate: value =>
                                                    value === password || "Passwords do not match",
                                            })}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPasswordResetConfirm(!showPasswordResetConfirm)}
                                                            edge="end"
                                                        >
                                                            {showPasswordResetConfirm ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <button type="submit" className="btn btn-primary w-100 loginBtn">Save Password <ArrowForwardIosIcon sx={{ fontSize: 13 }} /></button>
                                    </div>
                                </form>

                            </div>
                        }
                        {activePage === 'resetSuccessfully' &&
                            <div>
                                <div className="mt-4 text-center">
                                    <img src={checkEmailImg} alt="checkemail" />
                                    <div className="mt-3 continueTxt">Password Reset Successfully</div>
                                    <div className="welcomeBackTxt">
                                        You can now login with your new password.
                                    </div>

                                </div>
                                <div className="mt-2">
                                    <button className="btn btn-primary w-100 loginBtn" onClick={() => onCLickBackToLogin("resetSuccessfully")}>Back to Login <ArrowForwardIosIcon sx={{ fontSize: 13 }} /></button>
                                </div>
                            </div>
                        }

                    </div>

                </div>
                <div className="col-lg-6 col-md-6 d-none d-md-block">
                    <div>
                        <img src={loginImg} alt="Login-Image" className="login-img" />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Login;