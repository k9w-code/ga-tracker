// Grand Archive Formats
export const FORMATS = [
    { id: "Standard", label: "Standard" },
    { id: "Re:Constructed", label: "Re:Constructed" },
    { id: "Peasant", label: "Peasant" }
] as const;

export type FormatType = typeof FORMATS[number]['id'];

// Grand Archive Heroes by Format
export const HEROES_BY_FORMAT: Record<FormatType, string[]> = {
    "Standard": [
        "Lorraine",
        "Rai",
        "Silvie",
        "Zander",
        "Mordred",
        "Merlin",
        "Lancelot",
        "Arhur",
        "Tristan",
        "Gawain",
        "Nix",
        "Kira",
        "Tonon"
    ].sort(),
    "Re:Constructed": [
        "Lorraine",
        "Rai",
        "Silvie",
        "Zander",
        "Mordred",
        "Merlin",
        "Lancelot",
        "Arhur",
        "Tristan",
        "Gawain",
        "Nix",
        "Kira",
        "Tonon"
    ].sort(),
    "Peasant": [
        "Lorraine",
        "Rai",
        "Silvie",
        "Zander"
    ].sort()
};

// Grand Archive Elements
export const ELEMENTS = [
    { id: "Fire", label: "Fire" },
    { id: "Water", label: "Water" },
    { id: "Wind", label: "Wind" },
    { id: "Earth", label: "Earth" },
    { id: "Lux", label: "Lux" },
    { id: "Umbra", label: "Umbra" }
] as const;

// Grand Archive Classes
export const CLASSES = [
    { id: "Warrior", label: "Warrior" },
    { id: "Mage", label: "Mage" },
    { id: "Ranger", label: "Ranger" },
    { id: "Tamer", label: "Tamer" },
    { id: "Assassin", label: "Assassin" },
    { id: "Guardian", label: "Guardian" },
    { id: "Cleric", label: "Cleric" }
] as const;

// Flattened list for utility
export const ALL_HEROES = Array.from(new Set(Object.values(HEROES_BY_FORMAT).flat())).sort();
