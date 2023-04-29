import Home from "./views/Home/Home";
import Signin from "./views/Signin/Signin";
import Student from "./views/Student/Student";
import NavbarHOC from "./components/NavbarHOC";
import { AdminProvider } from "./context/admin.context";
import { CareersProvider } from "./context/careers.context";
import { StudentsProvider } from "./context/students.context";
import { Routes, Route, BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <CareersProvider>
          <StudentsProvider>
            <Routes>
              <Route path="/" element={NavbarHOC(Home)} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/student" element={NavbarHOC(Student)} />
              <Route path="/student/:id" element={NavbarHOC(Student)} />

              {/* Default route */}
              <Route path="*" element={NavbarHOC(Home)} />
            </Routes>
          </StudentsProvider>
        </CareersProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
