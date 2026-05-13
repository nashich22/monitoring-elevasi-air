"use client";
import React from "react";

interface PredictionData {
    time: string;
    predictedLevel: number | null;
    currentLevel: number;
    status: string;
    currentStatus: string;
    risk: string;
}

interface PredictionTableProps {
    data: PredictionData[];
}

export default function TabelPrediksi({ data }: PredictionTableProps) {
    if (data.length === 0) return null;

    const item = data[0];
    const hasPrediction = item.predictedLevel !== null;
    const trendValue = hasPrediction ? item.predictedLevel! - item.currentLevel : null;
    const trendLabel = hasPrediction ? (trendValue! >= 0 ? `+${trendValue} cm` : `${trendValue} cm`) : "-";

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Prediksi Elevasi Air (5 Menit Ke Depan)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-[11px] font-bold border-b border-gray-50">
                            <th className="px-6 py-4">Lokasi</th>
                            <th className="px-6 py-4">Status Saat Ini</th>
                            <th className="px-6 py-4">Ketinggian Saat Ini</th>
                            <th className="px-6 py-4">Prediksi Ketinggian</th>
                            <th className="px-6 py-4">Tren</th>
                            <th className="px-6 py-4">Status Prediksi</th>
                            <th className="px-6 py-4">Tingkat Risiko</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        <tr>
                            <td className="px-6 py-4 font-medium">Sungai Tegal Bal Karangrejo</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${item.currentStatus === "NORMAL" ? "bg-green-500" : item.currentStatus === "WASPADA" ? "bg-amber-500" : "bg-red-500"
                                    }`}>
                                    {item.currentStatus.charAt(0).toUpperCase() + item.currentStatus.slice(1).toLowerCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4">{item.currentLevel} cm</td>
                            <td className="px-6 py-4 font-bold">{hasPrediction ? `${item.predictedLevel} cm` : "-"}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-[11px] font-bold">
                                    {hasPrediction && trendValue !== null ? (
                                        <>
                                            <svg className={`w-4 h-4 ${trendValue >= 0 ? "text-red-500" : "text-green-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendValue >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                                            </svg>
                                            <span className={trendValue >= 0 ? "text-red-500" : "text-green-500"}>{trendLabel}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${!hasPrediction ? "bg-gray-400" : item.status === "NORMAL" ? "bg-green-500" : item.status === "WASPADA" ? "bg-amber-500" : "bg-red-500"
                                    }`}>
                                    {!hasPrediction ? "Menunggu" : item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${!hasPrediction ? "bg-gray-400" : item.risk.includes("Rendah") || item.risk.includes("Signifikan") ? "bg-green-500" : item.risk.includes("Sedang") || item.risk.includes("Menurun") || item.risk.includes("Bertahap") ? "bg-amber-500" : "bg-red-500"
                                    }`}>
                                    {!hasPrediction ? "-" : item.risk}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}



