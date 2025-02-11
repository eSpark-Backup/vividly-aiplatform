import { Routes, Route } from "react-router-dom";
import { CreatePassword, ForgotPassword, Home, LogIn, ResetPassword, SignUp, VerifyEmailSent } from "./pages";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
      <Route path="/verify-email/:token" element={<CreatePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
    </Routes>
  );
};

export default AppRouter;
