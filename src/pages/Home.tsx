import { useMemo } from "react";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, ArrowRight, Layers, Trophy, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "../utils/cn";

export default function Home() {
    const { matches, loading: matchesLoading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();

    const stats = useMemo(() => {
        const total = matches.length;
        const wins = matches.filter(m => m.result === 'win').length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        return { total, wins, winRate };
    }, [matches]);

    const recentMatches = useMemo(() => matches.slice(0, 3), [matches]);

    if (matchesLoading || decksLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/10">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    ホーム
                </h1>
                <div className="flex gap-2">
                    <Link to="/play">
                        <Button variant="outline" size="sm" className="rounded-full border-primary/30">
                            <Swords className="h-4 w-4 mr-1 text-primary" /> 对戦
                        </Button>
                    </Link>
                    <Link to="/matches">
                        <Button size="sm" className="rounded-full shadow-md">
                            <Plus className="h-4 w-4 mr-1" /> 記録
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <span className="text-4xl font-bold text-primary">{stats.winRate}%</span>
                        <span className="text-xs text-muted-foreground mt-1">勝率</span>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/20 border-white/10">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <span className="text-4xl font-bold">{stats.total}</span>
                        <span className="text-xs text-muted-foreground mt-1">全対戦数</span>
                    </CardContent>
                </Card>
            </div>

            {decks.length === 0 && (
                <Card className="border-dashed border-primary/50 bg-primary/5">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Layers className="h-8 w-8 mb-2 text-primary" />
                        <h3 className="font-semibold">デッキが見つかりません</h3>
                        <p className="text-xs text-muted-foreground mb-4">最初のデッキを登録して記録を始めましょう。</p>
                        <Link to="/decks">
                            <Button size="sm">デッキを登録</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-semibold">最近の対戦</h2>
                    <Link to="/matches" className="text-xs text-primary hover:underline flex items-center">
                        すべて表示 <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                </div>

                {recentMatches.length === 0 ? (
                    <Card className="border-dashed border-white/20 bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                            <Trophy className="h-8 w-8 mb-2 opacity-50" />
                            <p>対戦記録がまだありません。</p>
                            {decks.length > 0 && (
                                <Link to="/matches" className="mt-2 text-primary text-sm">最初の対戦を記録する</Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {recentMatches.map(match => {
                            const deck = decks.find(d => d.id === match.deckId);
                            return (
                                <div key={match.id} className="relative group animate-slide-up">
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1 rounded-l-md z-10",
                                        match.result === 'win' ? "bg-green-500" : match.result === 'loss' ? "bg-red-500" : "bg-yellow-500"
                                    )} />
                                    <Card className="pl-2 border-l-0 overflow-hidden bg-white/5 border-white/10">
                                        <CardContent className="p-3 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                        match.result === 'win' ? "bg-green-500/20 text-green-400" : match.result === 'loss' ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                                                    )}>
                                                        {match.result === 'win' ? '勝利' : match.result === 'loss' ? '敗北' : '引分'}
                                                    </span>
                                                    <span className="text-sm font-semibold">vs {match.opponentDeck}</span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground mt-1 flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <span>{format(new Date(match.date), "M/d")}</span>
                                                        <span>•</span>
                                                        <span>{deck?.name || "不明なデッキ"}</span>
                                                    </div>
                                                    {match.notes && (
                                                        <div className="text-[9px] text-white/50 truncate max-w-[150px]">
                                                            {match.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex gap-0.5">
                                                    {match.games?.map((g, i) => (
                                                        <span key={i} className={cn("text-[8px] px-1 rounded-sm", g.result === 'win' ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10")}>
                                                            {g.result === 'win' ? 'W' : 'L'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
