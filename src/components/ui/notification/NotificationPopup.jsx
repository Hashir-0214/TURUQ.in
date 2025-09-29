// src/components/ui/notification/NotificationPopup.jsx
"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const NotificationPopup = ({ 
  message = "Notification message", 
  type = "info", 
  duration = 5000,
  onClose = () => {}, 
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
      progressColor: "bg-green-500",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      progressColor: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      progressColor: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      progressColor: "bg-blue-500",
    },
  };
  
const config = typeConfig[type] || typeConfig["info"];
const IconComponent = config.icon;

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsClosing(false);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = 100 / (duration / 50);
          return Math.min(prev + increment, 100);
        });
      }, 50);

      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(closeTimer);
      };
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!show && !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm
          transform transition-all duration-300 ease-out
          ${config.bgColor} ${config.borderColor}
          ${isVisible && !isClosing 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-2 opacity-0 scale-95"}
          min-w-80 max-w-md
        `}
      >
        {/* Main content */}
        <div className="p-4 pr-12">
          <div className="flex items-start space-x-3">
            <IconComponent className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
            <p className="text-sm text-gray-800 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-100 ease-linear ${config.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
