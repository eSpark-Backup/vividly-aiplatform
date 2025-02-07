import { Routes, Route } from "react-router-dom";
import { CreatePassword, ForgotPassword, Home, LogIn, ResetPassword, SignUp, VerifyCode } from "./pages";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/create-password" element={<CreatePassword />} />
    </Routes>
  );
};

export default AppRouter;
