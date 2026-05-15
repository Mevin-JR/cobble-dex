import { useState } from "react";
import { Box } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPokemonDetails } from "../utils/pokeAPI";
import { useMarkedPokemon } from "../context/MarkedPokemonContext";

export type Pokemon = {
    id: string;
    name: string;
    sprite: string;
};

function getRegionName(id: number) {
    if (id <= 151) return "Kanto";
    if (id <= 251) return "Johto";
    if (id <= 386) return "Hoenn";
    if (id <= 493) return "Sinnoh";
    if (id <= 649) return "Unova";
    if (id <= 721) return "Kalos";
    if (id <= 809) return "Alola";
    if (id <= 905) return "Galar";
    return "Paldea";
}

interface PCBoxProps {
    index: number;
    pokemonList: Pokemon[];
}

function PokemonHoverCard({ pokemon }: { pokemon: Pokemon }) {
    const { data: details, isLoading } = useQuery({
        queryKey: ["pokemon", pokemon.id],
        queryFn: () => getPokemonDetails(pokemon.id),
        staleTime: Infinity,
    });

    return (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max min-w-40 flex flex-col gap-2 bg-[#0F172A] border border-(--border) rounded-lg shadow-xl p-3 z-50">
            <div>
                <p className="text-sm text-gray-400">#{pokemon.id}</p>
                <p className="font-bold capitalize text-white">{pokemon.name}</p>
            </div>
            
            <div className="flex gap-2 mt-1">
                {isLoading ? (
                    <div className="h-6 w-16 bg-slate-700 animate-pulse rounded-full"></div>
                ) : (
                    details?.types.map((t: any) => (
                        <span 
                            key={t.type.name} 
                            className="px-2 py-0.5 text-xs font-semibold capitalize rounded-full bg-slate-700 text-white"
                        >
                            {t.type.name}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}

export default function PCBox({ index, pokemonList }: PCBoxProps) {
    const [hovered, setHovered] = useState<Pokemon | null>(null);
    const { markedSet, toggleMark } = useMarkedPokemon();

    const firstId = Number(pokemonList[0]?.id || 0);
    const lastId = Number(pokemonList[pokemonList.length - 1]?.id || 0);
    const startRegion = getRegionName(firstId);
    const endRegion = getRegionName(lastId);
    const regionText = startRegion === endRegion ? startRegion : `${startRegion} / ${endRegion}`;
    
    const markedCount = pokemonList.filter(p => markedSet.has(p.id)).length;

    return (
        <div className="w-full flex flex-col border border-(--border) rounded-2xl">
            <div className="h-16 w-full flex items-center justify-between px-5 bg-(--bg-accent) rounded-[1rem_1rem_0_0]">
                <div className="flex gap-2">
                    <Box size={26} className="text-(--accent)" />
                    <span className="font-semibold text-white">Box {index + 1}: {regionText} ({firstId} - {lastId})</span>
                </div>
                <span className="text-sm font-semibold text-gray-400">
                    {markedCount} / {pokemonList.length}
                </span>
            </div>
            <div className="w-full mx-auto grid grid-cols-5 md:grid-cols-6 gap-2 p-2">
                {pokemonList.map((pokemon) => {
                    const isMarked = markedSet.has(pokemon.id);
                    return (
                    <div
                        key={pokemon.id}
                        className={`relative h-20 w-full flex flex-col items-center justify-center rounded-lg border transition-colors duration-200 cursor-pointer ${
                            isMarked 
                                ? "bg-red-900/40 border-red-500" 
                                : "bg-[#131B2E] border-transparent hover:border-(--accent)"
                        }`}
                        onMouseEnter={() => setHovered(pokemon)}
                        onMouseLeave={() => setHovered(null)}
                        onDoubleClick={() => toggleMark(pokemon.id)}
                    >
                        <img
                            className="w-full h-full object-contain [image-rendering:pixelated] scale-[1.2] hover:scale-[1.3] transition-transform"
                            src={pokemon.sprite}
                            alt={pokemon.name}
                        />
                        <span className="absolute bottom-1 left-1.5 text-[10px] text-gray-400 font-semibold z-10 bg-[#0F172A]/80 px-1 rounded">
                            #{pokemon.id}
                        </span>

                        {hovered?.id === pokemon.id && <PokemonHoverCard pokemon={pokemon} />}
                    </div>
                )})}
            </div>
        </div>
    );
}

export function PCBoxSkeleton(_props: { index: number }) {
    return (
        <div className="w-full flex flex-col border border-(--border) rounded-2xl animate-pulse">
            <div className="h-16 w-full flex items-center px-5 bg-(--bg-accent) rounded-[1rem_1rem_0_0]">
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 bg-slate-700 rounded-md"></div>
                    <div className="w-16 h-5 bg-slate-700 rounded-md"></div>
                </div>
            </div>
            <div className="w-full mx-auto grid grid-cols-5 md:grid-cols-6 gap-2 p-2">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 w-full bg-[#131B2E] rounded-lg"
                    ></div>
                ))}
            </div>
        </div>
    );
}
