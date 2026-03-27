"use client";
import { useState } from "react";

export default function CaseStatusPage() {
    const [form, setForm] = useState({
        lst_case: "",
        txtno: "",
        txtyear: "",
        caseid: ""
    });

    const [responseHtml, setResponseHtml] = useState("Response will appear here...");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setResponseHtml("<p class='text-gray-600 dark:text-gray-300'>Loading...</p>");

        const params = new URLSearchParams({
            id: form.caseid,
            lst_case: form.lst_case,
            txtno: form.txtno,
            txtyear: form.txtyear,
        });

        try {
            const res = await fetch(`/api/caseSearch?${params.toString()}`);
            const html = await res.text();
            setResponseHtml(html);
        } catch (error: any) {
            setResponseHtml(`<p class='text-red-500 dark:text-red-400'>Error: ${error.message}</p>`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0D1117] px-6 py-10 text-gray-900 dark:text-gray-200">
            <h2 className="text-3xl font-bold mb-6">
                🔍 MPHC Case Status Search
            </h2>

            <form
                onSubmit={handleSubmit}
                className="
                bg-white dark:bg-[#161B22]
                border border-gray-300 dark:border-gray-800
                shadow-xl rounded-xl p-6 max-w-lg space-y-4"
            >
                <div>
                    <label className="block font-medium mb-1">Case Type</label>
                    <input type="text" name="lst_case" onChange={handleChange} required className="w-full border rounded-lg px-4 py-2" />
                </div>

                <div>
                    <label className="block font-medium mb-1">Case Number</label>
                    <input type="text" name="txtno" onChange={handleChange} required className="w-full border rounded-lg px-4 py-2" />
                </div>

                <div>
                    <label className="block font-medium mb-1">Case Year</label>
                    <input type="text" name="txtyear" onChange={handleChange} required className="w-full border rounded-lg px-4 py-2" />
                </div>

                <div>
                    <label className="block font-medium mb-1">Case ID</label>
                    <input type="text" name="caseid" onChange={handleChange} required className="w-full border rounded-lg px-4 py-2" />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                >
                    Search Case Status
                </button>
            </form>

            <div
                className="case-html mt-8 bg-white dark:bg-[#161B22] border shadow-xl rounded-xl p-6 min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: responseHtml }}
            />
        </div>
    );
}