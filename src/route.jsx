import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AItoHumanize, Billing, Chat, CreatePassword, Explore, ForgotPassword, Home, HowToUse, Landing, LogIn, NotFound, PricingPlan, Profile, ResetPassword, Settings, SignUp, VerifyEmailSent } from "./pages";
import { DashboardLayout } from "./layout";
import AuthGuard from "./AuthGuard";
import { setNavigate } from "./services/NavigationService";
import DasbboardGuard from "./DasbboardGuard";

const AppRouter = () => {

  function NavigationSetter() {
    const navigate = useNavigate()

    useEffect(() => {
      setNavigate(navigate)
    }, [navigate])

    return null
  }

  return (
    <>
      <NavigationSetter />
      <Routes >
        <Route path="/" element={<Landing />} />

        {/* AUTH PROTECTED ROUTES IF LOG-IN */}
        <Route element={<AuthGuard />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/log-in" element={<LogIn />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/create-password/:token" element={<CreatePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* DASHBOARD PROTECTED ROUTES IF NOT LOG-IN  */}
        <Route element={<DasbboardGuard />}>
          <Route element={<DashboardLayout element={<DashboardLayout />} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/home?cat=expore" element={<Explore />} />
            <Route path="/home?cat=chat" element={<Chat />} />
            <Route path="/home?cat=ai-to-humanize" element={<AItoHumanize />} />
            <Route path="/home?cat=how-to-use" element={<HowToUse />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/pricing-plan" element={<PricingPlan />} />
          </Route>
        </Route>

        {/* 404 - Catch-All Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
};

export default AppRouter;
