import { Routes, Route } from "react-router-dom";
import { ForgotPassword, Home, LogIn, ResetPassword, SignUp, VerifyCode } from "./pages";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRouter;
