export const getPokemonList = async () => {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025", {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch pokemon details");
        }

        const data = await res.json();
        return data.results.map((p: any) => {
            const id = p.url.split("/").slice(-2, -1)[0];

            return {
                id,
                name: p.name,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            };
        });
    } catch (err) {
        console.error(err);
    }
};

export const getPokemonDetails = async (id: string) => {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) {
            throw new Error("Failed to fetch pokemon details");
        }
        return await res.json();
    } catch (err) {
        console.error(err);
    }
};
