import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { Deck } from "../types";

export function useDecks() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDecks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ga_decks')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Map DB fields to camelCase if necessary (matching our Deck type)
            const mappedDecks: Deck[] = data.map(d => ({
                id: d.id,
                name: d.name,
                hero: d.hero,
                format: d.format,
                decklistUrl: d.fabrary_url,
                imageUrl: d.image_url,
                createdAt: d.created_at || new Date().toISOString(),
                archived: !!d.archived
            }));
            setDecks(mappedDecks);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const sortedDecks = useMemo(() => {
        return [...decks].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [decks]);

    const addDeck = async (deck: Omit<Deck, "id" | "createdAt" | "archived">) => {
        const { decklistUrl, ...rest } = deck;
        const { data, error } = await supabase
            .from('ga_decks')
            .insert([{
                ...rest,
                fabrary_url: decklistUrl,
                user_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (!error && data) {
            const newDeck: Deck = {
                id: data.id,
                name: data.name,
                hero: data.hero,
                format: data.format,
                decklistUrl: data.fabrary_url,
                slug: data.slug,
                imageUrl: data.image_url,
                createdAt: data.created_at,
                archived: data.archived
            };
            setDecks(prev => [newDeck, ...prev]);
            return newDeck;
        }
        return null;
    };

    const updateDeck = async (id: string, deck: Partial<Omit<Deck, "id" | "createdAt">>) => {
        const { decklistUrl, ...rest } = deck;
        const updateData: any = { ...rest };
        if (decklistUrl !== undefined) {
            updateData.fabrary_url = decklistUrl;
        }

        const { error } = await supabase
            .from('ga_decks')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            setDecks(prev => prev.map(d => d.id === id ? { ...d, ...deck } : d));
        }
        return error;
    };

    const deleteDeck = async (id: string) => {
        const { error } = await supabase.from('decks').delete().eq('id', id);
        if (!error) {
            setDecks((prev) => prev.filter((deck) => deck.id !== id));
        }
    };

    const getDeck = (id: string) => decks.find((d) => d.id === id);

    return {
        decks: sortedDecks,
        loading,
        addDeck,
        updateDeck,
        deleteDeck,
        getDeck,
        refresh: fetchDecks
    };
}
