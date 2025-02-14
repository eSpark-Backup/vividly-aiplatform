import { Routes, Route } from "react-router-dom";
import { Billing, CreatePassword, ForgotPassword, Home, Landing, LogIn, PricingPlan, ResetPassword, SignUp, VerifyEmailSent } from "./pages";
import { DashboardLayout } from "./layout";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
      <Route path="/verify-email/:token" element={<CreatePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />


      <Route element={<DashboardLayout element={<DashboardLayout />} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/pricing-plan" element={<PricingPlan />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
