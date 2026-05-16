import { useQuery } from "@tanstack/react-query";
import { getPokemonList } from "../utils/pokeAPI";
import Navbar from "../components/navbar";
import { useMemo, useState, useEffect } from "react";
import PCBox, { PCBoxSkeleton, type Pokemon } from "../components/PCBox";
import FilterBar from "../components/FilterBar";
import { useMarkedPokemon } from "../context/MarkedPokemonContext";
import { getRegionByPokemonId } from "../utils/helpers";

export default function Dex() {
    const query = useQuery({
        queryKey: ["pokemon"],
        queryFn: getPokemonList,
        staleTime: Infinity,
    });

    const { markedSet, updateMarks } = useMarkedPokemon();

    const [selectedRegions, setSelectedRegions] = useState<string[]>(() => {
        const saved = localStorage.getItem("selectedRegions");
        return saved ? JSON.parse(saved) : [];
    });
    const [statusFilter, setStatusFilter] = useState<"All" | "Caught" | "Uncaught">(() => {
        const saved = localStorage.getItem("statusFilter");
        return (saved as any) || "All";
    });

    useEffect(() => {
        localStorage.setItem("selectedRegions", JSON.stringify(selectedRegions));
    }, [selectedRegions]);

    useEffect(() => {
        localStorage.setItem("statusFilter", statusFilter);
    }, [statusFilter]);

    const handleRegionToggle = (region: string) => {
        if (region === "All") {
            setSelectedRegions([]);
            return;
        }
        setSelectedRegions(prev => 
            prev.includes(region) 
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    const handleClearFilters = () => {
        setSelectedRegions([]);
        setStatusFilter("All");
    };

    const { processedChunks, totalFiltered, markedFiltered } = useMemo(() => {
        if (!query.data) return { processedChunks: [], totalFiltered: 0, markedFiltered: 0 };

        const sorted = [...query.data].sort((a, b) => a.id - b.id);
        
        let totalFilteredCount = 0;
        let markedFilteredCount = 0;

        // First, apply filters to each pokemon to set isVisible flag
        const processedPokemon = sorted.map((p) => {
            const numId = Number(p.id);
            const region = getRegionByPokemonId(numId);
            const isMarked = markedSet.has(p.id);

            let isVisible = true;

            // Region Filter
            if (selectedRegions.length > 0 && !selectedRegions.includes(region)) {
                isVisible = false;
            }

            // Status Filter
            if (statusFilter === "Caught" && !isMarked) {
                isVisible = false;
            }
            if (statusFilter === "Uncaught" && isMarked) {
                isVisible = false;
            }

            if (isVisible) {
                totalFilteredCount++;
                if (isMarked) {
                    markedFilteredCount++;
                }
            }

            return { ...p, isVisible } as Pokemon;
        });

        const chunks = [];
        for (let i = 0; i < processedPokemon.length; i += 30) {
            const chunk = processedPokemon.slice(i, i + 30);
            
            // Only add chunk if it has at least one visible pokemon
            const hasVisible = chunk.some(p => p.isVisible);
            if (hasVisible) {
                chunks.push(chunk);
            }
        }

        return { 
            processedChunks: chunks, 
            totalFiltered: totalFilteredCount, 
            markedFiltered: markedFilteredCount 
        };
    }, [query.data, selectedRegions, statusFilter, markedSet]);

    const totalPokemon = query.data?.length || 0;
    const globalMarkedCount = markedSet.size;
    const completionPercentage = totalPokemon > 0 
        ? ((globalMarkedCount / totalPokemon) * 100).toFixed(1) 
        : "0.0";

    const handleMarkAll = () => {
        const visibleIds = processedChunks.flatMap(chunk => 
            chunk.filter(p => p.isVisible).map(p => p.id)
        );
        updateMarks(visibleIds, []);
    };

    const handleClearAllMarked = () => {
        const visibleIds = processedChunks.flatMap(chunk => 
            chunk.filter(p => p.isVisible).map(p => p.id)
        );
        updateMarks([], visibleIds);
    };

    return (
        <>
            <Navbar />
            <section className="mt-5 max-w-[95vw] lg:max-w-[80vw] mx-auto pb-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 mt-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-(--accent) mb-2">National Pokédex</h1>
                        <p className="text-gray-400 text-sm md:text-base font-medium">Catch 'em all, and track 'em all</p>
                    </div>

                    <div className="bg-[#131B2E] border border-(--border) rounded-xl p-4 w-full md:w-64 shadow-lg flex flex-col gap-1">
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Completion</span>
                            <span className="text-xs font-bold text-emerald-500">{completionPercentage}%</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">
                            {globalMarkedCount} <span className="text-gray-400 text-xl font-semibold">/ {totalPokemon}</span>
                        </span>
                        <div className="w-full h-1.5 bg-[#0F172A] rounded-full mt-2 overflow-hidden border border-(--border)">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" 
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <FilterBar 
                    selectedRegions={selectedRegions}
                    onRegionToggle={handleRegionToggle}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    onClearFilters={handleClearFilters}
                    totalFiltered={totalFiltered}
                    markedFiltered={markedFiltered}
                />

                <div className="flex justify-end gap-3 mb-6 mt-2">
                    <button 
                        onClick={handleClearAllMarked}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Clear All Marked
                    </button>
                    <button 
                        onClick={handleMarkAll}
                        className="bg-[#131B2E] hover:bg-slate-800 text-(--accent) border border-(--border) hover:border-(--accent) px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Mark All
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {query.isLoading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <PCBoxSkeleton key={index} index={index} />
                            ))}
                        </>
                    ) : (
                        processedChunks.map((group, index) => (
                            <PCBox key={index} index={index} pokemonList={group} />
                        ))
                    )}
                </div>
            </section>
        </>
    );
}
