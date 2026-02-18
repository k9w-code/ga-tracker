export type Hero = string;
export type Format = string;

export interface Deck {
    id: string;
    name: string;
    hero: Hero;
    format: Format;
    decklistUrl?: string; // e.g. https://index.gatcg.com/deck/...
    slug?: string;
    imageUrl?: string;
    createdAt: string;
    archived: boolean;
}

export interface Tournament {
    id: string;
    name: string;
    date: string;
    format: Format;
    notes?: string;
}

export interface GameResult {
    first: boolean;
    result: 'win' | 'loss';
}

export interface Match {
    id: string;
    deckId: string;
    tournamentId?: string;
    opponentDeck: string;
    eventName?: string;
    result: 'win' | 'loss' | 'draw';
    games: GameResult[];
    date: string;
    notes?: string;
}

export interface Stats {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
}
