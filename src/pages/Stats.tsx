import { useMemo } from "react";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Card, CardContent } from "../components/ui/card";
import { Layers } from "lucide-react";

export default function Stats() {
    const { matches, loading: matchesLoading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();

    const deckStats = useMemo(() => {
        return decks.map(deck => {
            const deckMatches = matches.filter(m => m.deckId === deck.id);
            const total = deckMatches.length;
            const wins = deckMatches.filter(m => m.result === 'win').length;
            const losses = deckMatches.filter(m => m.result === 'loss').length;
            const draws = deckMatches.filter(m => m.result === 'draw').length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            return {
                id: deck.id,
                name: deck.name,
                wins,
                losses,
                draws,
                total,
                winRate
            };
        }).sort((a, b) => b.winRate - a.winRate);
    }, [decks, matches]);

    if (matchesLoading || decksLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/10">
                <h1 className="text-2xl font-bold">統計</h1>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-primary" />
                    デッキ別勝率
                </h2>

                {deckStats.length === 0 ? (
                    <div className="text-center py-10 opacity-50 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <p>デッキ登録がありません。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {deckStats.map(stat => (
                            <Card key={stat.id} className="overflow-hidden border-white/10 bg-white/5 animate-slide-up">
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-600"></div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{stat.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary">{stat.winRate}%</div>
                                            <div className="text-[10px] text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {stat.wins}勝 - {stat.losses}敗 {stat.draws > 0 && `- ${stat.draws}分`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${stat.winRate}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 text-right text-[10px] text-muted-foreground">
                                        Total: {stat.total} matches
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
