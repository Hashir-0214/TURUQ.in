// src/components/ui/notification/NotificationProvider.jsx
"use client";

import React, { createContext, useContext, useState } from "react";
import NotificationPopup from "./NotificationPopup";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, message, show: true, duration };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.map((n) => (
        <NotificationPopup
          key={n.id}
          message={n.message}
          type={n.type}
          show={n.show}
          duration={n.duration}
          onClose={() => removeNotification(n.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotification = () => {
  return useContext(NotificationContext);
};
