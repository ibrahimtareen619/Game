import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/log";
import Home from "./pages/Home";
import MatchWaiting from "./pages/MatchWaiting";
import GameScreen from "./pages/GameScreen";
import History from "./pages/History";
import Leaderboard from "./pages/leaderboard";
import Navbar from "./components/Navbar";
import UpdateProfile from "./pages/ypdateprofile";
import Welcome from "./pages/welcome";

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/newgame") || location.pathname.startsWith("/login") || location.pathname.startsWith("/signup") || location.pathname =="/";


  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/newgame/waiting" element={<MatchWaiting />} />
        <Route path="/newgame/:gameId" element={<GameScreen />} />
        <Route path="/history" element={<History />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
