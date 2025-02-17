import { Routes, Route } from "react-router-dom";
import { Billing, Chat, CreatePassword, Explore, ForgotPassword, Home, HowToUse, Landing, LogIn, NotFound, PricingPlan, ResetPassword, SignUp, VerifyEmailSent } from "./pages";
import { DashboardLayout } from "./layout";
import AuthGuard from "./AuthGuard";

const AppRouter = () => {
  return (
    <Routes >
      <Route path="/" element={<Landing />} />

      {/* PROTECTED ROUTES IF LOG-IN */}
      <Route element={<AuthGuard />}>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/verify-email/:token" element={<CreatePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* DASHBOARD ROUTES */}
      <Route element={<DashboardLayout element={<DashboardLayout />} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/home?cat=expore" element={<Explore />} />
        <Route path="/home?cat=chat" element={<Chat />} />
        <Route path="/home?cat=how-to-use" element={<HowToUse />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/pricing-plan" element={<PricingPlan />} />
      </Route>

      {/* 404 - Catch-All Route */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRouter;
