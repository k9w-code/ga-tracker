import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Tournament } from "../types";

export function useTournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTournaments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            const mappedTournaments: Tournament[] = data.map(t => ({
                id: t.id,
                name: t.name,
                date: t.date,
                format: t.format,
                notes: t.notes
            }));
            setTournaments(mappedTournaments);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const sortedTournaments = useMemo(() => {
        return [...tournaments].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [tournaments]);

    const addTournament = async (tournament: Omit<Tournament, "id">) => {
        const { data, error } = await supabase
            .from('tournaments')
            .insert([{
                user_id: (await supabase.auth.getUser()).data.user?.id,
                name: tournament.name,
                date: tournament.date,
                format: tournament.format,
                notes: tournament.notes
            }])
            .select()
            .single();

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
        const { error } = await supabase.from('tournaments').delete().eq('id', id);
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
