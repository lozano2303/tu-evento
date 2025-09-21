import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout.jsx";

import LadingPage from "./components/views/ladingPage.jsx";
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
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <MainLayout>
            <LadingPage />
          </MainLayout>
        }
      />

      <Route
        path="/landingPage"
        element={
          <MainLayout>
            <LadingPage />
          </MainLayout>
        }
      />

      <Route path="/FloorPlanDesigner" element={<Maquetation />} />

      <Route
        path="/events"
        element={
          <MainLayout>
            <Events />
          </MainLayout>
        }
      />
      <Route
        path="/event-info"
        element={
          <MainLayout>
            <EventsInfo />
          </MainLayout>
        }
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/event-request" element={<EventRequestForm onBack={() => window.history.back()} />} />
    </Routes>
  );
};

export default App;
