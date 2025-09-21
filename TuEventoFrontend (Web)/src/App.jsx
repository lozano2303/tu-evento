import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/loyout/MainLayout.jsx";

import LadingPage from "./components/views/lading-page.jsx";
import Login from "./components/views/login.jsx";
import Maquetation from "./components/views/FloorPlanDesigner.jsx"

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

      {/* Maquetation SIN layout (directo) */}
      <Route path="/FloorPlanDesigner" element={<Maquetation />} />
    </Routes>
  );
};

export default App;
