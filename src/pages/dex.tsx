import { useQuery } from "@tanstack/react-query";
import { getPokemonList } from "../utils/pokeAPI";
import Navbar from "../components/navbar";
import { useMemo } from "react";
import PCBox, { PCBoxSkeleton } from "../components/PCBox";

export default function Dex() {
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
            <section className="mt-5 max-w-[95vw] lg:max-w-[80vw] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
                {query.isLoading ? (
                    <>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <PCBoxSkeleton key={index} index={index} />
                        ))}
                    </>
                ) : (
                    sortedChunks.map((group, index) => (
                        <PCBox key={index} index={index} pokemonList={group} />
                    ))
                )}
            </section>
        </>
    );
}
