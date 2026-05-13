"use client";
import React from "react";

interface WaterTableProps {
    data: { time: string; level: number; status: string }[];
}

export default function TabelAir({ data }: WaterTableProps) {
    // We only show the latest record as "Current Data" per the image
    const latest = data[0] || { time: "-", level: 0, status: "-" };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Data Ketinggian Air Saat Ini</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-[11px] font-bold border-b border-gray-50">
                            <th className="px-6 py-4">Lokasi</th>
                            <th className="px-6 py-4">Ketinggian (cm)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Waktu Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-sm text-gray-700">
                            <td className="px-6 py-4 font-medium">Sungai Tegal Bal Karangrejo</td>
                            <td className="px-6 py-4 font-bold">{latest.level} cm</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm ${latest.status === "NORMAL"
                                            ? "bg-green-500"
                                            : latest.status === "WASPADA"
                                                ? "bg-amber-500"
                                                : latest.status === "BAHAYA"
                                                    ? "bg-red-500"
                                                    : "bg-gray-400"
                                        }`}
                                >
                                    {latest.status.charAt(0).toUpperCase() + latest.status.slice(1).toLowerCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">{latest.time}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

