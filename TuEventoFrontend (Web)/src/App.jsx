import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout.jsx";

import LadingPage from "./components/views/lading-page.jsx";
import Login from "./components/views/login.jsx";
import Maquetation from "./components/views/FloorPlanDesigner.jsx";
import Events from "./components/views/Events.jsx";
import EventsInfo from "./components/views/EventsInfo.jsx";
import AdminLogin from "./components/views/AdminLogin.jsx";
import AdminDashboard from "./components/views/AdminDashboard.jsx";
import EventRequestForm from "./components/views/Forms/EventRequestForm.jsx";

const App = () => {
  return (
    <Routes>
      {/* Login sin layout */}
      <Route path="/login" element={<Login />} />

      {/* LadingPage con layout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <LadingPage />
          </MainLayout>
        }
      />

      {/* Landing Page con layout */}
      <Route
        path="/landing-page"
        element={
          <MainLayout>
            <LadingPage />
          </MainLayout>
        }
      />

      {/* Maquetation SIN layout (directo) */}
      <Route path="/FloorPlanDesigner" element={<Maquetation />} />

      {/* Events con layout */}
      <Route
        path="/events"
        element={
          <MainLayout>
            <Events />
          </MainLayout>
        }
      />

      {/* EventsInfo con layout */}
      <Route
        path="/event-info"
        element={
          <MainLayout>
            <EventsInfo />
          </MainLayout>
        }
      />

      {/* Admin Login sin layout */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Admin Dashboard sin layout */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* Event Request Form sin layout */}
      <Route path="/event-request" element={<EventRequestForm onBack={() => window.history.back()} />} />
    </Routes>
  );
};

export default App;
