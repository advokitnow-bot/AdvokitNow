"use client";

import { useState } from "react";

export default function CauseListPage() {
    const [place, setPlace] = useState("IND");
    const [courts, setCourts] = useState("15");
    const [loading, setLoading] = useState(false);
    const [htmlData, setHtmlData] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setHtmlData("");

        try {
            const response = await fetch("/api/mphc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ place, courts }),
            });

            const data = await response.json();
            setHtmlData(data.html || "<p>No data found</p>");
        } catch (err) {
            setHtmlData("<p style='color:red'>Failed to load data</p>");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                MP High Court Display Board — Fetch Data
            </h1>

            {/* Form */}
            <div className="flex gap-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">Place</label>
                    <select
                        className="border p-2 rounded"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                    >
                        <option value="IND">Indore</option>
                        <option value="JBP">Jabalpur</option>
                        <option value="GWL">Gwalior</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-medium">Courts</label>
                    <input
                        type="number"
                        className="border p-2 rounded"
                        value={courts}
                        onChange={(e) => setCourts(e.target.value)}
                    />
                </div>

                <button
                    onClick={fetchData}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-6"
                >
                    Fetch Data
                </button>
            </div>

            {/* Loader */}
            {loading && <p className="text-blue-500">Loading...</p>}

            {/* Render HTML */}
            {!loading && htmlData && (
                <div
                    className="mt-4 border p-4 bg-white rounded shadow"
                    dangerouslySetInnerHTML={{ __html: htmlData }}
                />
            )}
        </div>
    );
}
