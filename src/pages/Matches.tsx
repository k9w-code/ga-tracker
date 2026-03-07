import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Button } from "../components/ui/button";
import { Plus, Sword } from "lucide-react";
import { cn } from "../utils/cn";
import { MatchForm } from "../components/features/matches/MatchForm";
import { MatchCard } from "../components/features/matches/MatchCard";
import type { Match } from "../types";

export default function Matches() {
    const { matches, addMatch, deleteMatch, updateMatch, loading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();
    const location = useLocation();
    const [isAdding, setIsAdding] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [filterDeckId, setFilterDeckId] = useState("all");

    useEffect(() => {
        let isMounted = true;
        if (location.state?.isAdding && isMounted) {
            // timeoutを使って同期的なsetStateの警告を回避する
            setTimeout(() => {
                if (isMounted) {
                    setIsAdding(true);
                    window.history.replaceState({}, document.title);
                }
            }, 0);
        }
        return () => { isMounted = false; };
    }, [location]);

    const handleEdit = (match: Match) => {
        setEditingMatch(match);
        setIsAdding(true);
    };

    const handleSave = async (data: Omit<Match, "id">) => {
        if (editingMatch) {
            await updateMatch(editingMatch.id, data);
        } else {
            await addMatch(data);
        }
        setIsAdding(false);
        setEditingMatch(null);
    };

    const handleDelete = async (id: string) => {
        await deleteMatch(id);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingMatch(null);
    };

    if (loading || decksLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const filteredMatches = filterDeckId === "all"
        ? matches
        : matches.filter(m => m.deckId === filterDeckId);

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-border">
                <h1 className="text-2xl font-bold">対戦履歴</h1>
                <Button onClick={() => {
                    if (isAdding) {
                        handleCancel();
                    } else {
                        setIsAdding(true);
                        setEditingMatch(null);
                    }
                }} size="sm">
                    {isAdding ? "キャンセル" : (
                        <>
                            <Plus className="h-4 w-4 mr-1" />
                            記録
                        </>
                    )}
                </Button>
            </header>

            {isAdding && (
                <MatchForm
                    decks={decks}
                    initialData={editingMatch || undefined}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                />
            )}

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <button
                    onClick={() => setFilterDeckId("all")}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                        filterDeckId === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                    )}
                >
                    すべてのデッキ
                </button>
                {decks.map(deck => (
                    <button
                        key={deck.id}
                        onClick={() => setFilterDeckId(deck.id)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            filterDeckId === deck.id ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                        )}
                    >
                        {deck.name}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredMatches.length === 0 ? (
                    <div className="text-center py-10 opacity-50 flex flex-col items-center">
                        <Sword className="h-12 w-12 mb-2 text-muted-foreground" />
                        <p>対戦記録がありません。</p>
                    </div>
                ) : (
                    filteredMatches.map((match: Match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            deck={decks.find(d => d.id === match.deckId)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

