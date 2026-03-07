import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Tournament } from "../types";

export function useTournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTournaments = async (isMounted = true) => {
        if (isMounted) setLoading(true);
        const { data, error } = await supabase
            .from('ga_tournaments')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data && isMounted) {
            const mappedTournaments: Tournament[] = data.map(t => ({
                id: t.id,
                name: t.name,
                date: t.date,
                format: t.format,
                notes: t.notes
            }));
            setTournaments(mappedTournaments);
        }
        if (isMounted) setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            await fetchTournaments(isMounted);
        };
        init();
        return () => { isMounted = false; };
    }, []);

    const sortedTournaments = useMemo(() => {
        return [...tournaments].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [tournaments]);

    const addTournament = async (tournament: Omit<Tournament, "id">) => {
        const { data, error } = await supabase.rpc('add_tournament', {
            p_name: tournament.name,
            p_date: tournament.date,
            p_format: tournament.format,
            p_deck_id: null,
            p_placement: null,
            p_total_players: null,
            p_notes: tournament.notes
        });

        if (!error && data) {
            const newTournament: Tournament = {
                id: data.id,
                name: data.name,
                date: data.date,
                format: data.format,
                notes: data.notes
            };
            setTournaments(prev => [newTournament, ...prev]);
            return newTournament;
        }
        return null;
    };

    const deleteTournament = async (id: string) => {
        const { error } = await supabase.from('ga_tournaments').delete().eq('id', id);
        if (!error) {
            setTournaments((prev) => prev.filter((t) => t.id !== id));
        }
    };

    return {
        tournaments: sortedTournaments,
        loading,
        addTournament,
        deleteTournament,
        refresh: fetchTournaments
    };
}
