"use client";

import { useEffect } from "react";
import * as microsoftTeams from "@microsoft/teams-js";

export default function TeamsLogin() {
    useEffect(() => {
        microsoftTeams.app.initialize().catch(() => {
            // Not running inside Teams — safe to ignore in dev
        });
    }, []);

    const handleLogin = async () => {
        try {
            await microsoftTeams.authentication.authenticate({
                url: `${window.location.origin}/login?teams=true`,
                width: 600,
                height: 535,
            });
            window.location.reload();
        } catch (error) {
            console.error("Login failed:", error);
            alert("auth failed: " + JSON.stringify(error)); // temp debug
        }
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center flex flex-col gap-4">
                <p className="text-sm text-slate-600">Sign in to use Norbit</p>
                <button
                    onClick={handleLogin}
                    className=" cursor-pointer hover:bg-gray-700 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                    Sign in
                </button>
            </div>
        </div>
    );
}