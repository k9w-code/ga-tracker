import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Match } from "../types";

export function useMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            const mappedMatches: Match[] = data.map(m => ({
                id: m.id,
                deckId: m.deck_id,
                tournamentId: m.tournament_id,
                opponentHero: m.opponent_hero,
                result: m.result,
                first: !!m.first,
                date: m.date || new Date().toISOString(),
                notes: m.notes || ""
            }));
            setMatches(mappedMatches);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [matches]);

    const addMatch = async (match: Omit<Match, "id" | "date"> & { date?: string }) => {
        const { data, error } = await supabase
            .from('matches')
            .insert([{
                user_id: (await supabase.auth.getUser()).data.user?.id,
                deck_id: match.deckId,
                tournament_id: match.tournamentId,
                opponent_hero: match.opponentHero,
                result: match.result,
                first: match.first,
                date: match.date || new Date().toISOString(),
                notes: match.notes
            }])
            .select()
            .single();

        if (!error && data) {
            const newMatch: Match = {
                id: data.id,
                deckId: data.deck_id,
                tournamentId: data.tournament_id,
                opponentHero: data.opponent_hero,
                result: data.result,
                first: data.first,
                date: data.date,
                notes: data.notes
            };
            setMatches(prev => [newMatch, ...prev]);
            return newMatch;
        }
        return null;
    };

    const deleteMatch = async (id: string) => {
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (!error) {
            setMatches((prev) => prev.filter((m) => m.id !== id));
        }
    };

    const updateMatch = async (id: string, updates: Partial<Match>) => {
        const { error } = await supabase
            .from('matches')
            .update({
                deck_id: updates.deckId,
                tournament_id: updates.tournamentId,
                opponent_hero: updates.opponentHero,
                result: updates.result,
                first: updates.first,
                date: updates.date,
                notes: updates.notes
            })
            .eq('id', id);

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
