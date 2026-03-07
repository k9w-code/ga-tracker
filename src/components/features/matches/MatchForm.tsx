import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Select } from "../../../components/ui/select";
import { Trash2 } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { Deck, Match, GameResult } from "../../../types";

interface MatchFormProps {
    decks: Deck[];
    initialData?: Partial<Match>;
    onSubmit: (data: Omit<Match, "id">) => Promise<void>;
    onCancel: () => void;
}

export function MatchForm({ decks, initialData, onSubmit, onCancel }: MatchFormProps) {
    const [selectedDeckId, setSelectedDeckId] = useState(initialData?.deckId || "");
    const [opponentDeck, setOpponentDeck] = useState(initialData?.opponentDeck || "");
    const [eventName, setEventName] = useState(initialData?.eventName || "");
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>(initialData?.result || "win");
    const [games, setGames] = useState<GameResult[]>(initialData?.games || [{ first: true, result: 'win' }]);
    const [date, setDate] = useState(initialData?.date || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setSelectedDeckId(initialData.deckId || "");
            setOpponentDeck(initialData.opponentDeck || "");
            setEventName(initialData.eventName || "");
            setResult(initialData.result || "win");
            setGames(initialData.games || [{ first: true, result: 'win' }]);
            setDate(initialData.date || "");
            setNotes(initialData.notes || "");
        }
    }, [initialData]);

    const calculateMatchResult = (gameResults: GameResult[]) => {
        const wins = gameResults.filter(g => g.result === 'win').length;
        const losses = gameResults.filter(g => g.result === 'loss').length;
        if (wins > losses) return 'win';
        if (losses > wins) return 'loss';
        return 'draw';
    };

    const addGame = () => {
        if (games.length < 3) {
            const newGames = [...games, { first: true, result: 'win' as const }];
            setGames(newGames);
            setResult(calculateMatchResult(newGames));
        }
    };

    const updateGame = (index: number, field: keyof GameResult, value: string | boolean) => {
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

    const handleSubmit = async () => {
        if (!selectedDeckId || !opponentDeck) return;
        setSubmitting(true);
        try {
            await onSubmit({
                deckId: selectedDeckId,
                opponentDeck,
                eventName,
                result,
                games,
                date: date || new Date().toISOString(),
                notes
            } as Omit<Match, "id">);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="animate-slide-up bg-card shadow-lg border-border">
            <CardContent className="space-y-4 pt-6">
                <div className="text-sm font-semibold mb-2">
                    {initialData?.id ? "対戦を編集" : "新しい対戦を記録"}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70">使用デッキ</label>
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
                    <label className="text-xs font-semibold text-foreground/70">相手のデッキ</label>
                    <input
                        placeholder="Crux Warrior"
                        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                        value={opponentDeck}
                        onChange={(e) => setOpponentDeck(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70">イベント名 (任意・最大40文字)</label>
                    <input
                        placeholder="ストア大会、フリー対戦など"
                        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value.slice(0, 40))}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-foreground/70 font-bold uppercase tracking-wider">対戦記録</label>
                        {games.length < 3 && (
                            <Button variant="ghost" size="sm" onClick={addGame} className="h-6 text-[10px] px-2 border border-border">
                                + ゲームを追加
                            </Button>
                        )}
                    </div>

                    {games.map((game, index) => (
                        <div key={index} className="space-y-2 p-3 bg-muted dark:bg-white/5 rounded-lg border border-border relative group/game">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-foreground/60">{index + 1}戦目</span>
                                {games.length > 1 && (
                                    <button onClick={() => removeGame(index)} className="text-red-400 hover:text-red-500 transition-colors p-1 bg-red-400/10 rounded-sm">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex bg-muted dark:bg-black/20 rounded p-0.5">
                                    <button
                                        className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.first ? "bg-primary text-white" : "text-foreground/50")}
                                        onClick={() => updateGame(index, 'first', true)}
                                    >先攻</button>
                                    <button
                                        className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", !game.first ? "bg-primary text-white" : "text-foreground/50")}
                                        onClick={() => updateGame(index, 'first', false)}
                                    >後攻</button>
                                </div>
                                <div className="flex bg-muted dark:bg-black/20 rounded p-0.5">
                                    <button
                                        className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.result === 'win' ? "bg-green-500 text-white" : "text-foreground/50")}
                                        onClick={() => updateGame(index, 'result', 'win')}
                                    >勝利</button>
                                    <button
                                        className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.result === 'loss' ? "bg-red-500 text-white" : "text-foreground/50")}
                                        onClick={() => updateGame(index, 'result', 'loss')}
                                    >敗北</button>
                                    <button
                                        className={cn("flex-1 py-1 text-[10px] font-bold rounded-sm transition-colors", game.result === 'draw' ? "bg-yellow-500 text-white" : "text-foreground/50")}
                                        onClick={() => updateGame(index, 'result', 'draw')}
                                    >引分</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-foreground/70 mb-2 block">最終結果</label>
                    <div className="flex bg-muted dark:bg-white/5 rounded-md p-1">
                        <button
                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'win' ? "bg-green-500 text-white" : "text-foreground/50")}
                            onClick={() => setResult('win')}
                        >勝利</button>
                        <button
                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'loss' ? "bg-red-500 text-white" : "text-foreground/50")}
                            onClick={() => setResult('loss')}
                        >敗北</button>
                        <button
                            className={cn("flex-1 py-1.5 text-xs font-bold rounded-sm transition-colors", result === 'draw' ? "bg-yellow-500 text-white" : "text-foreground/50")}
                            onClick={() => setResult('draw')}
                        >引分</button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70">メモ (最大40文字)</label>
                    <input
                        placeholder="対戦の振り返りなど..."
                        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 40))}
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <Button variant="outline" className="w-1/3" onClick={onCancel}>
                        キャンセル
                    </Button>
                    <Button className="w-2/3" onClick={handleSubmit} disabled={!selectedDeckId || !opponentDeck || submitting}>
                        {submitting ? "保存中..." : (initialData?.id ? "更新する" : "保存する")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
