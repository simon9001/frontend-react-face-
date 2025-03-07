import React from "react";

interface CameraFeedProps {
  name: string;
  source: string;
  status: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ name, source, status }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative h-40 bg-gray-900">
        {status === "active" ? (
          <img src={source} alt={name} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-sm">Camera Offline</p>
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center">
          <span className={`w-2 h-2 rounded-full ${status === "active" ? "bg-green-500" : "bg-red-500"} mr-1`}></span>
          <span className="text-white text-xs">{status === "active" ? "Live" : "Offline"}</span>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
