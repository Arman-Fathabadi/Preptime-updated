import React, { useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        localStorage.setItem("preptime-guest", "true");
        localStorage.setItem("preptime-username", name.trim());

        // Small delay for effect
        setTimeout(() => {
            router.push("/");
        }, 500);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/10 p-8 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to PrepTime</h2>
                    <p className="text-slate-300">
                        Let's get your workspace ready
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            What should we call you?
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-white transition-all hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Continue to App"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
