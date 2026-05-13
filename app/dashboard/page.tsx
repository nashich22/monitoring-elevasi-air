"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import KartuStatus from "@/components/KartuStatus";
import TabelAir from "@/components/TabelAir";
import TabelPrediksi from "@/components/TabelPrediksi";
import { rtdb } from "@/lib/firebase";
import { ref, query, limitToLast, onValue } from "firebase/database";

// Dynamic import for Leaflet (CSR only)
const PetaLokasi = dynamic(() => import("@/components/PetaLokasi"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">Memuat Peta...</div>
});

export default function DashboardPage() {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [riskInfo, setRiskInfo] = useState({ status: "LOADING", risk: "Memuat...", color: "#9ca3af" });
    const [history, setHistory] = useState<{ time: string; level: number; status: string }[]>([]);
    const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
    const [predictions, setPredictions] = useState<{
        time: string;
        predictedLevel: number | null;
        currentLevel: number;
        status: string;
        currentStatus: string;
        risk: string
    }[]>([]);
    const [isAlertDismissed, setIsAlertDismissed] = useState(false);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);

    const getStatus = (level: number) => {
        if (level <= 50) return "NORMAL";
        if (level <= 75) return "WASPADA";
        return "BAHAYA";
    };

    const getRiskAnalysis = (current: number, predicted: number | null) => {
        if (predicted === null) return { status: "LOADING", risk: "Menunggu Prediksi...", color: "#9ca3af" };

        const curS = getStatus(current);
        const predS = getStatus(predicted);

        if (curS === "NORMAL") {
            if (predS === "NORMAL") return { status: "NORMAL", risk: "Rendah", color: "#22c55e" };
            if (predS === "WASPADA") return { status: "WASPADA", risk: "Waspada (Sedang)", color: "#f59e0b" };
            if (predS === "BAHAYA") return { status: "BAHAYA", risk: "Bahaya (Tinggi)", color: "#ef4444" };
        }
        if (curS === "WASPADA") {
            if (predS === "NORMAL") return { status: "NORMAL", risk: "Waspada (Menurun)", color: "#f59e0b" };
            if (predS === "WASPADA") return { status: "WASPADA", risk: "Waspada (Sedang)", color: "#f59e0b" };
            if (predS === "BAHAYA") return { status: "BAHAYA", risk: "(Tinggi) Bahaya", color: "#ef4444" };
        }
        if (curS === "BAHAYA") {
            if (predS === "NORMAL") return { status: "NORMAL", risk: "Menurun Signifikan", color: "#22c55e" };
            if (predS === "WASPADA") return { status: "WASPADA", risk: "Menurun Bertahap", color: "#f59e0b" };
            if (predS === "BAHAYA") return { status: "BAHAYA", risk: "(Kritis) Bahaya", color: "#ef4444" };
        }
        return { status: "NORMAL", risk: "Rendah", color: "#22c55e" };
    };

    useEffect(() => {
        // Mengambil data dari node 'iot/monitoring' di Realtime Database
        const refSensor = ref(rtdb, "iot/monitoring");

        const unsubscribeSensor = onValue(refSensor, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Data diterima dari Firebase:", data);

                if (data) {
                    // Menggunakan data elevasi_air sebagai ketinggian air
                    const level = parseFloat(data.elevasi_air?.toString() || "0");
                    
                    // Format timestamp if it exists, otherwise use current time
                    const timeStr = data.timestamp 
                        ? new Date(data.timestamp).toLocaleString("id-ID") 
                        : new Date().toLocaleString("id-ID");

                    if (data.latitude && data.longitude) {
                         setLocation({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
                    }

                    setCurrentLevel(level);

                    const status = getStatus(level);
                    if (status !== "BAHAYA") {
                        setIsAlertDismissed(false);
                    }

                    // Update history
                    setHistory([{ time: timeStr, level: level, status: status }]);

                    // Prediksi dari alat IoT
                    const predLevel = data.prediksi !== undefined && data.prediksi !== null ? parseFloat(data.prediksi) : null;
                    
                    // Kita bisa tetap menggunakan getRiskAnalysis untuk menentukan status dan risk jika IoT tidak mengirimkannya,
                    // atau menggunakan data langsung dari IoT jika ada.
                    const analysis = getRiskAnalysis(level, predLevel);

                    setRiskInfo({
                        status: data.predicted_status || analysis.status,
                        risk: data.risk || analysis.risk,
                        color: analysis.color // color bisa tetap dari frontend atau sesuaikan
                    });
                    
                    setPredictions([{
                        time: timeStr,
                        predictedLevel: predLevel,
                        currentLevel: level,
                        status: data.predicted_status || analysis.status,
                        currentStatus: status,
                        risk: data.risk || analysis.risk
                    }]);
                }
            } else {
                console.log("Node iot/monitoring tidak ditemukan di Firebase");
                setFirebaseError("Data pada node iot/monitoring kosong atau tidak ditemukan. (Pastikan huruf kecil semua)");
            }
        }, (error) => {
            console.error("Error mengambil data dari Firebase:", error);
            setFirebaseError(error.message || "Gagal menghubungi Firebase. Pastikan koneksi internet stabil dan aturan (Rules) Firebase mengizinkan read.");
        });

        return () => unsubscribeSensor();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans notranslate" translate="no">
            {/* Error Message Display */}
            {firebaseError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-8 mt-4" role="alert">
                    <strong className="font-bold">Firebase Error: </strong>
                    <span className="block sm:inline">{firebaseError}</span>
                    <p className="mt-2 text-xs">DB URL Terbaca: {process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "TIDAK TERBACA"}</p>
                </div>
            )}

            {/* Floating Danger Alert */}
            {getStatus(currentLevel) === "BAHAYA" && !isAlertDismissed && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-[#e30000] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-bold text-[15px] leading-tight tracking-wide">PERINGATAN! Kondisi Sungai Bahaya</h4>
                        <p className="text-[13px] mt-0.5 text-white/90">Segera lakukan pencegahan</p>
                    </div>
                    <button 
                        onClick={() => setIsAlertDismissed(true)}
                        className="flex-shrink-0 p-1 hover:bg-black/10 rounded-md transition-colors ml-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Navigasi / Header Refined */}
            <nav className="bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
                <div>
                    <h1 suppressHydrationWarning className="text-2xl font-bold text-[#001f3f] tracking-tight">Dashboard Monitoring Elevasi Air</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-8">
                {/* Section 1: Status Cards (3 Grid) */}
                <KartuStatus level={currentLevel} />

                {/* Section 2: Current Water Data */}
                <TabelAir data={history} />

                {/* Section 3: Prediction Data */}
                <TabelPrediksi data={predictions} />

                {/* Section 4: Maps Visualization */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Peta Lokasi Alat Monitoring</h3>
                    <div className="rounded-lg overflow-hidden h-[450px] border border-gray-100">
                        <PetaLokasi
                            currentLevel={currentLevel}
                            mapColor={riskInfo.color}
                            risk={riskInfo.risk}
                            status={riskInfo.status}
                            latitude={location.lat}
                            longitude={location.lng}
                        />
                    </div>
                </div>
            </div>

            <footer className="mt-16 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pb-10">
                &copy; 2024 BPBD Kabupaten Jember - Flood Information System
            </footer>
        </main>
    );
}
