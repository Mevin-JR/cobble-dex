import { useState } from "react";
import { NavLink } from "react-router-dom";

export type Tab = "Home" | "Dex";

type NavItem = {
    label: Tab;
    link: string;
};

export default function Navbar() {
    const [searchValue, setSearchValue] = useState("");

    const navItems: NavItem[] = [
        { label: "Home", link: "/" },
        { label: "Dex", link: "/dex" },
    ];

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
            <div className="flex items-center justify-center gap-2">
                <button className="bg-(--accent) rounded-lg text-(--text-accent) px-4 py-1.5">
                    Login
                </button>
            </div>
        </nav>
    );
}
