export const REGIONS = [
    { name: "Kanto", label: "Kanto (Gen 1)", min: 1, max: 151 },
    { name: "Johto", label: "Johto (Gen 2)", min: 152, max: 251 },
    { name: "Hoenn", label: "Hoenn (Gen 3)", min: 252, max: 386 },
    { name: "Sinnoh", label: "Sinnoh (Gen 4)", min: 387, max: 493 },
    { name: "Unova", label: "Unova (Gen 5)", min: 494, max: 649 },
    { name: "Kalos", label: "Kalos (Gen 6)", min: 650, max: 721 },
    { name: "Alola", label: "Alola (Gen 7)", min: 722, max: 809 },
    { name: "Galar", label: "Galar (Gen 8)", min: 810, max: 905 },
    { name: "Paldea", label: "Paldea (Gen 9)", min: 906, max: 1025 },
];

export function getRegionByPokemonId(id: number) {
    const region = REGIONS.find((r) => id >= r.min && id <= r.max);
    return region ? region.name : "Unknown";
}
