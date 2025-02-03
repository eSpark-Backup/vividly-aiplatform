import { Routes, Route } from "react-router-dom";
import { Home, LogIn } from "./pages";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/log-in" element={<LogIn />} />
    </Routes>
  );
};

export default AppRouter;
