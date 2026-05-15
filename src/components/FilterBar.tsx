import { useState, useRef, useEffect } from "react";
import { REGIONS } from "../utils/helpers";
import { ChevronDown, Filter, Check } from "lucide-react";

interface FilterBarProps {
    selectedRegions: string[];
    onRegionToggle: (region: string) => void;
    statusFilter: "All" | "Caught" | "Uncaught";
    onStatusChange: (status: "All" | "Caught" | "Uncaught") => void;
    onClearFilters: () => void;
    totalFiltered: number;
    markedFiltered: number;
}

export default function FilterBar({
    selectedRegions,
    onRegionToggle,
    statusFilter,
    onStatusChange,
    onClearFilters,
    totalFiltered,
    markedFiltered,
}: FilterBarProps) {
    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const regionRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
                setIsRegionOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full bg-(--bg-accent) border border-(--border) rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter size={20} />
                    <span className="font-semibold hidden sm:inline">Filters:</span>
                </div>
                
                {/* Region/Gen Multi-Select Dropdown */}
                <div className="relative" ref={regionRef}>
                    <button
                        onClick={() => setIsRegionOpen(!isRegionOpen)}
                        className="flex items-center gap-2 bg-[#131B2E] border border-(--border) hover:border-(--accent) transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                        {selectedRegions.length === 0 
                            ? "All Regions" 
                            : `${selectedRegions.length} Region${selectedRegions.length > 1 ? 's' : ''} Selected`}
                        <ChevronDown size={16} />
                    </button>

                    {isRegionOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#0F172A] border border-(--border) rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto p-1 flex flex-col gap-1">
                                <button
                                    onClick={() => onRegionToggle("All")}
                                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium ${
                                        selectedRegions.length === 0 
                                            ? "bg-slate-800 text-(--accent)" 
                                            : "text-white hover:bg-[#131B2E]"
                                    }`}
                                >
                                    All Regions
                                    {selectedRegions.length === 0 && <Check size={16} />}
                                </button>
                                {REGIONS.map((region) => {
                                    const isSelected = selectedRegions.includes(region.name);
                                    return (
                                        <button
                                            key={region.name}
                                            onClick={() => onRegionToggle(region.name)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium ${
                                                isSelected 
                                                    ? "bg-slate-800 text-(--accent)" 
                                                    : "text-white hover:bg-[#131B2E]"
                                            }`}
                                        >
                                            {region.label}
                                            {isSelected && <Check size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Custom Dropdown */}
                <div className="relative" ref={statusRef}>
                    <button
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        className="flex items-center gap-2 bg-[#131B2E] border border-(--border) hover:border-(--accent) transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold min-w-[140px] justify-between"
                    >
                        {statusFilter === "All" ? "All Pokémon" : statusFilter === "Caught" ? "Caught Only" : "Uncaught Only"}
                        <ChevronDown size={16} />
                    </button>

                    {isStatusOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[140px] bg-[#0F172A] border border-(--border) rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-1 flex flex-col gap-1">
                                {["All", "Caught", "Uncaught"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            onStatusChange(status as any);
                                            setIsStatusOpen(false);
                                        }}
                                        className={`text-left px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium ${
                                            statusFilter === status 
                                                ? "bg-slate-800 text-(--accent)" 
                                                : "text-white hover:bg-[#131B2E]"
                                        }`}
                                    >
                                        {status === "All" ? "All Pokémon" : status === "Caught" ? "Caught Only" : "Uncaught Only"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {(selectedRegions.length > 0 || statusFilter !== "All") && (
                    <button
                        onClick={onClearFilters}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider whitespace-nowrap"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-(--border) pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-white tracking-wide">
                        {markedFiltered} <span className="text-(--accent) text-lg uppercase tracking-wider">Caught</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-400 mt-1">
                        ({markedFiltered} / {totalFiltered})
                    </span>
                </div>
            </div>
        </div>
    );
}
