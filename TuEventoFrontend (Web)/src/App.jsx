import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layout/MainLayout.jsx";
import ProtectedRoute from "./layout/ProtectedRoute.jsx";

import LadingPage from "./pages/ladingPage.jsx";
import Login from "./pages/login.jsx";
import Maquetation from "./pages/FloorPlanDesigner.jsx";
import Events from "./pages/Events.jsx";
import EventsInfo from "./pages/EventsInfo.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SeatManagement from "./pages/SeatManagement.jsx";
import EventManagement from "./pages/EventManagement.jsx";
import EventForm from "./pages/EventForm.jsx";
import CompleteEvent from "./pages/CompleteEvent.jsx";
import OrganizerPetitionForm from "./pages/OrganizerPetitionForm.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import EventImagesView from "./test/EventImagesView.jsx";
import UserProfile from "./pages/UserProfile.jsx";

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
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seat-management" element={<SeatManagement />} />
      <Route path="/event-management" element={<EventManagement />} />
      <Route path="/create-event" element={<EventForm />} />
      <Route path="/event-form" element={<EventForm />} />
      <Route path="/complete-event" element={<CompleteEvent />} />
      <Route path="/organizer-petition" element={<OrganizerPetitionForm />} />
      <Route
        path="/nosotros"
        element={
          <MainLayout>
            <AboutUs />
          </MainLayout>
        }
      />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/test" element={<EventImagesView />} />
    </Routes>
  );
};

export default App;
