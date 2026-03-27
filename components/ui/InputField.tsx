"use client";

import { useRef, useState } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";

export function InputField({ label, name, type = "text" }: any) {
    const [showPassword, setShowPassword] = useState(false);
    const [fileName, setFileName] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileRef = useRef<any>();

    function handleFileChange(e: any) {
        const file = e.target.files?.[0];
        if (file) setFileName(file.name);
    }

    function dragHandler(e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        if (e.type === "dragleave") setDragActive(false);
    }

    function dropHandler(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileName(file.name);
            fileRef.current.files = e.dataTransfer.files;
        }
    }

    // FILE INPUT UI
    if (type === "file") {
        return (
            <label className="block">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>

                <div
                    onDragEnter={dragHandler}
                    onDragLeave={dragHandler}
                    onDragOver={dragHandler}
                    onDrop={dropHandler}
                    onClick={() => fileRef.current.click()}
                    className={`mt-1 border-2 border-dashed rounded-lg p-4 flex flex-col items-center cursor-pointer transition
          ${dragActive ? "border-blue-600 bg-blue-50 dark:bg-gray-800"
                            : "border-gray-400 dark:border-gray-600"}`}
                >
                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                        Drag & Drop or Click to Upload
                    </span>
                    {fileName && <p className="mt-1 text-green-600 text-sm">{fileName}</p>}
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    name={name}
                    required
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                />
            </label>
        );
    }

    // PASSWORD INPUT UI
    const isPassword = type === "password";

    return (
        <label className="block relative">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
            <input
                type={isPassword ? (showPassword ? "text" : "password") : type}
                name={name}
                required
                placeholder={label}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 
        bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 
        focus:ring-blue-500 focus:ring-2 outline-none transition"
            />

            {/* Password Eye Toggle */}
            {isPassword && (
                <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[39px] cursor-pointer text-gray-600 dark:text-gray-400"
                >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </span>
            )}
        </label>
    );
}
