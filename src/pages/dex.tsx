import { useQuery } from "@tanstack/react-query";
import { getPokemonList } from "../utils/pokeAPI";
import Navbar from "../components/navbar";
import { useMemo, useState } from "react";
import { Box } from "lucide-react";

type Pokemon = {
    id: string;
    name: string;
    sprite: string;
};

export default function Dex() {
    const [hovered, setHovered] = useState<Pokemon | null>(null);

    const query = useQuery({
        queryKey: ["pokemon"],
        queryFn: getPokemonList,
        staleTime: Infinity,
    });

    const sortedChunks = useMemo(() => {
        if (!query.data) return [];

        const sorted = [...query.data].sort((a, b) => a.id - b.id);

        const chunks = [];
        for (let i = 0; i < sorted.length; i += 30) {
            chunks.push(sorted.slice(i, i + 30));
        }

        return chunks;
    }, [query.data]);

    return (
        <>
            <Navbar />
            <section className="mt-5 max-w-[80vw] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
                {sortedChunks.map((group, index) => (
                    <div
                        key={index}
                        className="w-full flex flex-col border border-(--border) rounded-2xl"
                    >
                        <div className="h-16 w-full flex items-center px-5 bg-(--bg-accent) rounded-[1rem_1rem_0_0]">
                            <div className="flex gap-2">
                                <Box size={26} className="text-(--accent)" />
                                <span>Box: {index + 1}</span>
                            </div>
                        </div>
                        <div className="w-full mx-auto grid grid-cols-6 grid-rows-5 gap-2 p-2">
                            {group.map((pokemon: Pokemon) => (
                                <div
                                    key={pokemon.id}
                                    className="relative h-20 w-24 flex flex-col items-center justify-center bg-[#131B2E] rounded-lg hover:border-(--accent) transition-colors duration-200 cursor-pointer"
                                    onMouseEnter={() => setHovered(pokemon)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <img
                                        height={75}
                                        width={75}
                                        src={pokemon.sprite}
                                        alt={pokemon.name}
                                    />

                                    {hovered?.id === pokemon.id && (
                                        <div className="absolute left-0 top-full mt-2 w-40 flex items-center gap-2 bg-[#0F172A] border border-(--border) rounded-lg shadow-xl p-3 z-50">
                                            <div>
                                                <p className="text-sm text-gray-400">
                                                    #{pokemon.id}
                                                </p>
                                                <p className="font-bold capitalize text-white">
                                                    {pokemon.name}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}
