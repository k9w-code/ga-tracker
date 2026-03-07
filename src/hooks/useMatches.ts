import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Match } from "../types";

export function useMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async (isMounted = true) => {
        if (isMounted) setLoading(true);
        const { data, error } = await supabase
            .from('ga_matches')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data && isMounted) {
            const mappedMatches: Match[] = data.map(m => ({
                id: m.id,
                deckId: m.deck_id,
                tournamentId: m.tournament_id,
                opponentDeck: m.opponent_deck || m.opponent_hero || "",
                eventName: m.event_name,
                result: m.result,
                games: m.games || (m.first !== undefined ? [{ first: !!m.first, result: m.result === 'draw' ? 'win' : m.result }] : []),
                date: m.date || new Date().toISOString(),
                notes: m.notes || ""
            }));
            setMatches(mappedMatches);
        }
        if (isMounted) setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            await fetchMatches(isMounted);
        };
        init();
        return () => { isMounted = false; };
    }, []);

    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [matches]);

    const addMatch = async (match: Omit<Match, "id" | "date"> & { date?: string }) => {
        const { data, error } = await supabase.rpc('add_match', {
            p_deck_id: match.deckId,
            p_tournament_id: match.tournamentId,
            p_opponent_deck: match.opponentDeck,
            p_event_name: match.eventName,
            p_result: match.result,
            p_games: match.games,
            p_date: match.date || new Date().toISOString(),
            p_notes: match.notes
        });

        if (!error && data) {
            const newMatch: Match = {
                id: data.id,
                deckId: data.deck_id,
                tournamentId: data.tournament_id,
                opponentDeck: data.opponent_deck,
                eventName: data.event_name,
                result: data.result,
                games: data.games,
                date: data.date,
                notes: data.notes
            };
            setMatches(prev => [newMatch, ...prev]);
            return newMatch;
        }
        if (error) {
            console.error("Error adding match:", error);
        }
        return null;
    };

    const deleteMatch = async (id: string) => {
        const { error } = await supabase.from('ga_matches').delete().eq('id', id);
        if (!error) {
            setMatches((prev) => prev.filter((m) => m.id !== id));
        }
    };

    const updateMatch = async (id: string, updates: Partial<Match>) => {
        const { error } = await supabase.rpc('update_match', {
            p_id: id,
            p_deck_id: updates.deckId,
            p_tournament_id: updates.tournamentId,
            p_opponent_deck: updates.opponentDeck,
            p_event_name: updates.eventName,
            p_result: updates.result,
            p_games: updates.games,
            p_date: updates.date,
            p_notes: updates.notes
        });

        if (!error) {
            setMatches((prev) =>
                prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
            );
        }
    };

    return {
        matches: sortedMatches,
        loading,
        addMatch,
        deleteMatch,
        updateMatch,
        refresh: fetchMatches
    };
}
