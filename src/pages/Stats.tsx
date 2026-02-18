import { useMemo, useState } from "react";
import { useMatches } from "../hooks/useMatches";
import { useDecks } from "../hooks/useDecks";
import { Card, CardContent } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Select } from "../components/ui/select";
import { FORMATS } from "../data/constants";
import type { Format } from "../types";
import { Swords, Layers } from "lucide-react";

export default function Stats() {
    const { matches, loading: matchesLoading } = useMatches();
    const { decks, loading: decksLoading } = useDecks();
    const [selectedFormat, setSelectedFormat] = useState<Format>('Classic Constructed');
    const [selectedDeckId, setSelectedDeckId] = useState<string>("all");

    // Filter decks by selected format
    const filteredDecks = useMemo(() => {
        return decks.filter(deck => deck.format === selectedFormat);
    }, [decks, selectedFormat]);

    const deckStats = useMemo(() => {
        return filteredDecks.map(deck => {
            const deckMatches = matches.filter(m => m.deckId === deck.id);
            const total = deckMatches.length;
            const wins = deckMatches.filter(m => m.result === 'win').length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            return {
                id: deck.id,
                name: deck.name,
                hero: deck.hero,
                wins,
                total,
                winRate
            };
        }).sort((a, b) => b.winRate - a.winRate);
    }, [filteredDecks, matches]);

    // Determine filtering content for Hero chart based on selected format matches
    const heroStats = useMemo(() => {
        const heroes: Record<string, { wins: number, total: number }> = {};
        const relevantMatches = matches.filter(m => {
            const deck = decks.find(d => d.id === m.deckId);
            const matchesFormat = deck && deck.format === selectedFormat;
            const matchesDeck = selectedDeckId === "all" || m.deckId === selectedDeckId;
            return matchesFormat && matchesDeck;
        });

        relevantMatches.forEach(m => {
            const hero = m.opponentHero || "Unknown";
            if (!heroes[hero]) heroes[hero] = { wins: 0, total: 0 };
            heroes[hero].total++;
            if (m.result === 'win') heroes[hero].wins++;
        });

        return Object.entries(heroes).map(([name, stats]) => ({
            name,
            total: stats.total,
            wins: stats.wins,
            winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);
    }, [matches, decks, selectedFormat, selectedDeckId]);

    if (matchesLoading || decksLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="flex justify-between items-center sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
                <h1 className="text-2xl font-bold">統計</h1>
                <div className="w-48">
                    <Select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as Format)}
                    >
                        {FORMATS.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-primary" />
                    デッキ別勝率 ({selectedFormat})
                </h2>

                {deckStats.length === 0 ? (
                    <div className="text-center py-10 opacity-50 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <p>このフォーマットのデッキ登録がありません。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {deckStats.map(stat => (
                            <Card key={stat.id} className="overflow-hidden border-white/10 bg-white/5 animate-slide-up">
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-600"></div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{stat.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">{stat.hero}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary">{stat.winRate}%</div>
                                            <div className="text-[10px] text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {stat.wins}勝 - {stat.total - stat.wins}敗
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${stat.winRate}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                        <Swords className="mr-2 h-5 w-5 text-secondary-foreground" />
                        相手ヒーロー別勝率 ({selectedFormat})
                    </h2>
                    <div className="w-full sm:w-64">
                        <Select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                        >
                            <option value="all">すべてのデッキ</option>
                            {filteredDecks.map(deck => (
                                <option key={deck.id} value={deck.id}>{deck.name}</option>
                            ))}
                        </Select>
                    </div>
                </div>
                <Card className="border-white/10 bg-white/5">
                    <CardContent className="h-64 pt-6">
                        {heroStats.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 h-full flex items-center justify-center">対戦データがありません。</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={heroStats} layout="vertical" margin={{ left: 0, right: 30 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#fff' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                                        {heroStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.winRate > 50 ? '#8b5cf6' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
