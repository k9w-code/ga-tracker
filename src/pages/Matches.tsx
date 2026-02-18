import { useState, useMemo } from "react";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { HEROES_BY_FORMAT } from "../data/constants";
import { Plus, Sword, Calendar, Trash2, Pencil } from "lucide-react";
import { cn } from "../utils/cn";
import { format } from "date-fns";
import type { Hero, Match } from "../types";

export default function Matches() {
    const { matches, addMatch, deleteMatch, updateMatch, loading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [opponentHero, setOpponentHero] = useState<Hero>("");
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>("win");
    const [isFirst, setIsFirst] = useState(true);

    const [filterDeckId, setFilterDeckId] = useState("all");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setSelectedDeckId("");
        setOpponentHero("");
        setResult("win");
        setIsFirst(true);
        setDate("");
        setNotes("");
    };

    // Edit State
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

    // Derived state for opponent heroes based on selected deck
    const opponentHeroOptions = useMemo(() => {
        const deckId = editingMatchId ? matches.find(m => m.id === editingMatchId)?.deckId : selectedDeckId;
        if (!deckId) return [];
        const deck = decks.find(d => d.id === deckId);
        if (!deck) return [];
        return (HEROES_BY_FORMAT as any)[deck.format] || [];
    }, [selectedDeckId, editingMatchId, matches, decks]);

    const handleEdit = (match: any) => {
        setEditingMatchId(match.id);
        setSelectedDeckId(match.deckId);
        setOpponentHero(match.opponentHero);
        setResult(match.result);
        setIsFirst(match.first);
        setDate(match.date); // Set date for editing
        setNotes(match.notes || ""); // Set notes for editing
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!selectedDeckId || !opponentHero) return;
        setSubmitting(true);
        const matchData = {
            deckId: selectedDeckId,
            opponentHero,
            result,
            first: isFirst, // Use isFirst here
            date: date || new Date().toISOString(),
            notes
        };

        if (editingMatchId) {
            await updateMatch(editingMatchId, matchData);
        } else {
            await addMatch(matchData);
        }

        setIsAdding(false);
        setEditingMatchId(null);
        resetForm();
        setSubmitting(false);
    };

    if (loading || decksLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
                <h1 className="text-2xl font-bold">対戦履歴</h1>
                <Button onClick={() => {
                    if (isAdding) {
                        setIsAdding(false);
                        setEditingMatchId(null);
                        resetForm(); // Reset form on cancel
                    } else {
                        setIsAdding(true);
                        resetForm(); // Reset form when opening for new match
                    }
                }} size="sm">
                    {isAdding ? "キャンセル" : (
                        <>
                            <Plus className="h-4 w-4 mr-1" />
                            対戦を記録
                        </>
                    )}
                </Button>
            </header>

            {isAdding && (
                <Card className="animate-slide-up bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                    <CardContent className="space-y-4 pt-6">
                        <div className="text-sm font-semibold mb-2">
                            {editingMatchId ? "対戦を編集" : "新しい対戦を記録"}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">使用デッキ</label>
                            <Select
                                value={selectedDeckId}
                                onChange={(e) => {
                                    setSelectedDeckId(e.target.value);
                                    setOpponentHero(""); // Reset opponent when deck changes (format might change)
                                }}
                            >
                                <option value="" disabled>デッキを選択</option>
                                {decks.map(deck => (
                                    <option key={deck.id} value={deck.id}>{deck.name} ({deck.hero})</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">相手のヒーロー</label>
                            <Select
                                value={opponentHero}
                                onChange={(e) => setOpponentHero(e.target.value)}
                                disabled={!selectedDeckId}
                            >
                                <option value="" disabled>ヒーローを選択</option>
                                {opponentHeroOptions.map((h: string) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">勝敗</label>
                                <div className="flex bg-white/5 rounded-md p-1">
                                    <button
                                        className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'win' ? "bg-green-500/80 text-white" : "text-muted-foreground hover:bg-white/10")}
                                        onClick={() => setResult('win')}
                                    >勝利</button>
                                    <button
                                        className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'loss' ? "bg-red-500/80 text-white" : "text-muted-foreground hover:bg-white/10")}
                                        onClick={() => setResult('loss')}
                                    >敗北</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">先攻/後攻</label>
                                <div className="flex bg-white/5 rounded-md p-1">
                                    <button
                                        className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", isFirst ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/10")}
                                        onClick={() => setIsFirst(true)}
                                    >先攻</button>
                                    <button
                                        className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", !isFirst ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/10")}
                                        onClick={() => setIsFirst(false)}
                                    >後攻</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">メモ (最大40文字)</label>
                            <input
                                placeholder="対戦の振り返りなど..."
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, 40))}
                            />
                        </div>

                        <Button className="w-full" onClick={handleSave} disabled={!selectedDeckId || !opponentHero || submitting}>
                            {submitting ? "保存中..." : (editingMatchId ? "更新する" : "保存する")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <button
                    onClick={() => setFilterDeckId("all")}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                        filterDeckId === "all" ? "bg-white text-black border-white" : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30"
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
                            filterDeckId === deck.id ? "bg-white text-black border-white" : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30"
                        )}
                    >
                        {deck.name}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {(() => {
                    const filteredMatches = filterDeckId === "all"
                        ? matches
                        : matches.filter(m => m.deckId === filterDeckId);

                    if (filteredMatches.length === 0) {
                        return (
                            <div className="text-center py-10 opacity-50 flex flex-col items-center">
                                <Sword className="h-12 w-12 mb-2 text-muted-foreground" />
                                <p>対戦記録がありません。</p>
                            </div>
                        );
                    }

                    return filteredMatches.map((match: Match) => {
                        const deck = decks.find(d => d.id === match.deckId);
                        return (
                            <div key={match.id} className="relative group">
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-md z-10",
                                    match.result === 'win' ? "bg-green-500" : match.result === 'loss' ? "bg-red-500" : "bg-yellow-500"
                                )} />
                                <Card className="pl-2 border-l-0 overflow-hidden bg-white/5 border-white/10">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-xs font-bold px-1.5 py-0.5 rounded",
                                                    match.result === 'win' ? "bg-green-500/20 text-green-400" : match.result === 'loss' ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                                                )}>
                                                    {match.result === 'win' ? '勝利' : match.result === 'loss' ? '敗北' : '引分'}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(match.date), "M/d HH:mm")}
                                                </span>
                                            </div>
                                            <div className="font-semibold text-base">
                                                vs {match.opponentHero}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {deck?.name || "不明なデッキ"} • {match.first ? "先攻" : "後攻"}
                                            </div>
                                            {match.notes && (
                                                <div className="text-xs mt-1 px-2 py-1 bg-white/5 border border-white/5 rounded italic text-white/70 break-all">
                                                    {match.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-white"
                                                onClick={() => handleEdit(match)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                onClick={() => {
                                                    if (confirm("この対戦記録を削除してもよろしいですか？")) {
                                                        deleteMatch(match.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    });
                })()}
            </div>
        </div>
    );
}
