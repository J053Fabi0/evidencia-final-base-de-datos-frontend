import Home from "./views/Home/Home";
import Signin from "./views/Signin/Signin";
import { AdminProvider } from "./context/admin.context";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import NavbarAndBottombar from "./components/NavbarAndBottombar";

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route path="/" element={NavbarAndBottombar(Home)} />
          <Route path="/signin" element={<Signin />} />

          {/* Default route */}
          <Route path="*" element={NavbarAndBottombar(Home)} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
}
