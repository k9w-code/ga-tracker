import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Plus, Sword, Calendar, Trash2, Pencil, MapPin } from "lucide-react";
import { cn } from "../utils/cn";
import { format } from "date-fns";
import type { Match, GameResult } from "../types";

export default function Matches() {
    const { matches, addMatch, deleteMatch, updateMatch, loading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();
    const location = useLocation();
    const [isAdding, setIsAdding] = useState(false);
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.isAdding) {
            setIsAdding(true);
            // 状態をクリアして、リロード時などに再度開かないようにする
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Form State
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [opponentDeck, setOpponentDeck] = useState("");
    const [eventName, setEventName] = useState("");
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>("win");
    const [games, setGames] = useState<GameResult[]>([
        { first: true, result: 'win' }
    ]);
    const [filterDeckId, setFilterDeckId] = useState("all");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setSelectedDeckId("");
        setOpponentDeck("");
        setEventName("");
        setResult("win");
        setGames([{ first: true, result: 'win' }]);
        setDate("");
        setNotes("");
    };

    // Simplified BO3 result calculation
    const calculateMatchResult = (gameResults: GameResult[]) => {
        const wins = gameResults.filter(g => g.result === 'win').length;
        const losses = gameResults.filter(g => g.result === 'loss').length;
        if (wins > losses) return 'win';
        if (losses > wins) return 'loss';
        return 'draw';
    };

    const handleEdit = (match: Match) => {
        setEditingMatchId(match.id);
        setSelectedDeckId(match.deckId);
        setOpponentDeck(match.opponentDeck);
        setEventName(match.eventName || "");
        setResult(match.result);
        setGames(match.games || [{ first: true, result: 'win' }]);
        setDate(match.date);
        setNotes(match.notes || "");
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!selectedDeckId || !opponentDeck) return;
        setSubmitting(true);

        const matchData = {
            deckId: selectedDeckId,
            opponentDeck,
            eventName,
            result,
            games: games,
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

    const addGame = () => {
        if (games.length < 3) {
            const newGames = [...games, { first: true, result: 'win' as const }];
            setGames(newGames);
            setResult(calculateMatchResult(newGames));
        }
    };

    const updateGame = (index: number, field: keyof GameResult, value: any) => {
        const newGames = [...games];
        newGames[index] = { ...newGames[index], [field]: value };
        setGames(newGames);
        setResult(calculateMatchResult(newGames));
    };

    const removeGame = (index: number) => {
        if (games.length > 1) {
            const newGames = games.filter((_, i) => i !== index);
            setGames(newGames);
            setResult(calculateMatchResult(newGames));
        }
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
            <header className="flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/10">
                <h1 className="text-2xl font-bold">対戦履歴</h1>
                <Button onClick={() => {
                    if (isAdding) {
                        setIsAdding(false);
                        setEditingMatchId(null);
                        resetForm();
                    } else {
                        setIsAdding(true);
                        resetForm();
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
                <Card className="animate-slide-up bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                    <CardContent className="space-y-4 pt-6">
                        <div className="text-sm font-semibold mb-2">
                            {editingMatchId ? "対戦を編集" : "新しい対戦を記録"}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">使用デッキ</label>
                            <Select
                                value={selectedDeckId}
                                onChange={(e) => setSelectedDeckId(e.target.value)}
                            >
                                <option value="" disabled>デッキを選択</option>
                                {decks.map(deck => (
                                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">相手のデッキ</label>
                            <input
                                placeholder="Crux Warrior"
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={opponentDeck}
                                onChange={(e) => setOpponentDeck(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">イベント名 (任意・最大40文字)</label>
                            <input
                                placeholder="ストア大会、フリー対戦など"
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value.slice(0, 40))}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Game Records</label>
                                {games.length < 3 && (
                                    <Button variant="ghost" size="sm" onClick={addGame} className="h-6 text-[10px] px-2 border border-white/10">
                                        + ゲームを追加
                                    </Button>
                                )}
                            </div>

                            {games.map((game, index) => (
                                <div key={index} className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/5 relative group/game">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold opacity-50">{index + 1}戦目</span>
                                        {games.length > 1 && (
                                            <button onClick={() => removeGame(index)} className="text-red-400 opacity-0 group-hover/game:opacity-100 transition-opacity">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex bg-black/20 rounded p-0.5">
                                            <button
                                                className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.first ? "bg-primary text-white" : "text-muted-foreground")}
                                                onClick={() => updateGame(index, 'first', true)}
                                            >先攻</button>
                                            <button
                                                className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", !game.first ? "bg-primary text-white" : "text-muted-foreground")}
                                                onClick={() => updateGame(index, 'first', false)}
                                            >後攻</button>
                                        </div>
                                        <div className="flex bg-black/20 rounded p-0.5">
                                            <button
                                                className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.result === 'win' ? "bg-green-500/80 text-white" : "text-muted-foreground")}
                                                onClick={() => updateGame(index, 'result', 'win')}
                                            >勝利</button>
                                            <button
                                                className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.result === 'loss' ? "bg-red-500/80 text-white" : "text-muted-foreground")}
                                                onClick={() => updateGame(index, 'result', 'loss')}
                                            >敗北</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <label className="text-xs text-muted-foreground mb-2 block">結果判定</label>
                            <div className="flex bg-white/5 rounded-md p-1">
                                <button
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'win' ? "bg-green-500 text-white" : "text-muted-foreground")}
                                    onClick={() => setResult('win')}
                                >勝利</button>
                                <button
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'loss' ? "bg-red-500 text-white" : "text-muted-foreground")}
                                    onClick={() => setResult('loss')}
                                >敗北</button>
                                <button
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'draw' ? "bg-yellow-500 text-white" : "text-muted-foreground")}
                                    onClick={() => setResult('draw')}
                                >引分</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">メモ (最大40文字)</label>
                            <input
                                placeholder="対戦の振り返りなど..."
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, 40))}
                            />
                        </div>

                        <Button className="w-full mt-2" onClick={handleSave} disabled={!selectedDeckId || !opponentDeck || submitting}>
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
                                        <div className="flex flex-col gap-1 w-full mr-2">
                                            {match.eventName && (
                                                <div className="flex items-center gap-1.5 text-primary-foreground/90 bg-primary/20 self-start px-2 py-0.5 rounded-full mb-1 border border-primary/20">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    <span className="text-[10px] font-bold tracking-tight">{match.eventName}</span>
                                                </div>
                                            )}
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
                                                vs {match.opponentDeck}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 my-1">
                                                {match.games && match.games.map((g, i) => (
                                                    <div key={i} className="flex items-center bg-white/5 px-1.5 py-0.5 rounded text-[9px] border border-white/10">
                                                        <span className="opacity-60 mr-1">{i + 1}:</span>
                                                        <span className={cn("font-bold mr-1", g.result === 'win' ? "text-green-400" : "text-red-400")}>
                                                            {g.result === 'win' ? 'W' : 'L'}
                                                        </span>
                                                        <span className="opacity-60 text-[8px]">{g.first ? '先' : '後'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {deck?.name || "不明なデッキ"}
                                            </div>
                                            {match.notes && (
                                                <div className="text-xs mt-1 px-2 py-1 bg-white/5 border border-white/5 rounded text-white/70 break-all">
                                                    {match.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 shrink-0">
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
