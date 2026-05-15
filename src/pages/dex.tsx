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

    const { markedSet } = useMarkedPokemon();

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

    return (
        <>
            <Navbar />
            <section className="mt-5 max-w-[95vw] lg:max-w-[80vw] mx-auto pb-10">
                <FilterBar 
                    selectedRegions={selectedRegions}
                    onRegionToggle={handleRegionToggle}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    onClearFilters={handleClearFilters}
                    totalFiltered={totalFiltered}
                    markedFiltered={markedFiltered}
                />

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
