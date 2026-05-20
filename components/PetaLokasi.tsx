"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapLeafletProps {
    currentLevel: number;
    mapColor: string;
    risk: string;
    status: string;
    latitude?: number;
    longitude?: number;
}

const PetaLokasi = ({ currentLevel, mapColor, risk, status, latitude, longitude }: MapLeafletProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.CircleMarker | null>(null);

    const lat = latitude ?? -8.139603; // Default ke Jember jika belum ada data gps
    const lng = longitude ?? 113.762384;

    // Use mapColor prop directly
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Initialize map
        mapInstance.current = L.map(mapRef.current).setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        // Initial marker
        markerRef.current = L.circleMarker([lat, lng], {
            color: "white",
            weight: 2,
            fillColor: mapColor,
            fillOpacity: 0.9,
            radius: 20
        })
            .addTo(mapInstance.current)
            .bindTooltip(`Sensor Jember Pusat<br/>Elevasi: ${currentLevel} cm<br/>Status: ${status}<br/>Risiko: ${risk}`, {
                permanent: true,
                direction: "top",
                className: "status-tooltip"
            });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (markerRef.current && mapInstance.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstance.current.setView([lat, lng]); // Menggeser peta mengikuti alat
            markerRef.current.setStyle({ fillColor: mapColor });
            markerRef.current.setTooltipContent(`Sensor Jember Pusat<br/>Elevasi: ${currentLevel} cm<br/>Status: ${status}<br/>Risiko: ${risk}`);
        }
    }, [currentLevel, mapColor, risk, status, lat, lng]);

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="mb-4">
                <h3 className="text-xl font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Peta Lokasi Alat & Status Terkini
                </h3>
            </div>
            <div
                ref={mapRef}
                className="h-[500px] w-full rounded-2xl border-4 border-white shadow-inner bg-gray-100 overflow-hidden"
            ></div>
            <style jsx global>{`
        .status-tooltip {
          background: rgba(0,0,0,0.8);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 12px;
        }
      `}</style>
        </div>
    );
};

export default PetaLokasi;
