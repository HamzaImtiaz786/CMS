import { Routes, Route } from "react-router-dom"; // use Routes directly
import Layout from "./components/layout";
import { AuthContextProvider } from "./context/Authcontext"; // Ensure correct case
import { ToastContextProvider } from "./context/ToastContext"; 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Correct case
import CreateContact from "./pages/CreateContact";
import AllContact from "./pages/AllContact";
import EditContact from "./pages/EditContact";



const App = () => {
  return (
    <ToastContextProvider>
      <AuthContextProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<CreateContact />} />
            <Route path="/mycontacts" element={<AllContact />} />
            <Route path="/edit/:id" element={<EditContact />} />
           
          </Routes>
        </Layout>
      </AuthContextProvider>
    </ToastContextProvider>
  );
};

export default App;
