import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type Tab = "Home" | "Dex";

type NavItem = {
    label: Tab;
    link: string;
};

export default function Navbar() {
    const { user, signInWithGoogle, logout } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const navItems: NavItem[] = [
        { label: "Home", link: "/" },
        { label: "Dex", link: "/dex" },
    ];

    const handleLogin = async () => {
        setIsLoggingIn(true);
        await signInWithGoogle();
        setIsLoggingIn(false);
    };

    return (
        <nav className="z-999 sticky top-0 h-20 w-full flex items-center justify-between py-5 px-10 border-b border-b-(--border) bg-(--bg)">
            <span className="text-(--accent) text-2xl font-bold">
                CobbleDex
            </span>
            <ul className="flex items-center justify-center gap-5 list-none flex-1">
                {navItems.map((item) => (
                    <li key={item.label}>
                        <NavLink
                            to={item.link}
                            className={({ isActive }) =>
                                `flex flex-col items-center ${
                                    isActive
                                        ? "text-(--accent) text-lg font-semibold"
                                        : "text-(--text)"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {item.label}
                                    {isActive && (
                                        <div className="h-0 w-[90%] border-2 border-(--accent) rounded" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
            
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="flex items-center gap-2">
                            {user.photoURL && (
                                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
                            )}
                            <span className="text-white text-sm hidden sm:block">{user.displayName}</span>
                        </div>
                        <button
                            className="bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg text-white px-4 py-1.5 cursor-pointer text-sm"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        className="bg-(--accent) hover:bg-blue-600 transition-colors rounded-lg text-(--text-accent) px-4 py-1.5 cursor-pointer disabled:opacity-50"
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? "Logging in..." : "Login"}
                    </button>
                )}
            </div>
        </nav>
    );
}
