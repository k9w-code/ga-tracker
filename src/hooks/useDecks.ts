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
                hero: d.hero || "",     // DBにない場合は空文字
                format: d.format || "", // DBにない場合は空文字
                decklistUrl: d.decklist_url,
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
        const { decklistUrl, name, imageUrl } = deck;
        const { data, error } = await supabase
            .from('ga_decks')
            .insert([{
                name,
                image_url: imageUrl,
                decklist_url: decklistUrl,
                user_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (!error && data) {
            const newDeck: Deck = {
                id: data.id,
                name: data.name,
                hero: "", // DBにないので空文字
                format: "", // DBにないので空文字
                decklistUrl: data.decklist_url,
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
        const updateData: any = {};
        if (deck.name !== undefined) updateData.name = deck.name;
        if (deck.decklistUrl !== undefined) updateData.decklist_url = deck.decklistUrl;
        if (deck.imageUrl !== undefined) updateData.image_url = deck.imageUrl;
        if (deck.archived !== undefined) updateData.archived = deck.archived;

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
        const { error } = await supabase.from('ga_decks').delete().eq('id', id);
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
