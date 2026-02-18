import { useState } from "react";
import { useTournaments } from "../hooks/useTournaments";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Format } from "../types";
import { FORMATS } from "../data/constants";

export default function Tournaments() {
    const { tournaments, addTournament, deleteTournament, loading } = useTournaments();
    const [isAdding, setIsAdding] = useState(false);

    const [name, setName] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [gameFormat, setGameFormat] = useState<Format>("Classic Constructed");
    const [notes, setNotes] = useState("");

    const handleSubmit = async () => {
        if (!name) return;
        setSubmitting(true);
        await addTournament({
            name,
            date: date || new Date().toISOString(),
            format: gameFormat,
            notes
        });
        setName("");
        setDate("");
        setNotes("");
        setIsAdding(false);
        setSubmitting(false);
    };

    const [submitting, setSubmitting] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="flex justify-between items-center bg-background/80 backdrop-blur-md py-4 sticky top-0 z-10 -mx-4 px-4 border-b border-white/5">
                <h1 className="text-2xl font-bold">大会履歴</h1>
                <Button onClick={() => setIsAdding(!isAdding)} size="sm">
                    {isAdding ? "キャンセル" : (
                        <>
                            <Plus className="h-4 w-4 mr-1" />
                            大会を登録
                        </>
                    )}
                </Button>
            </header>

            {isAdding && (
                <Card className="animate-slide-up border-primary/50">
                    <CardHeader>
                        <CardTitle className="text-base">大会情報を入力</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            placeholder="大会名 (例: Pro Quest)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <Select
                            value={gameFormat}
                            onChange={(e) => setGameFormat(e.target.value as Format)}
                        >
                            {FORMATS.map(f => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </Select>
                        <Button className="w-full" onClick={handleSubmit} disabled={!name || submitting}>
                            {submitting ? "登録中..." : "大会を登録"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {tournaments.length === 0 ? (
                    <div className="text-center py-10 opacity-50 flex flex-col items-center">
                        <p>大会記録がありません。</p>
                    </div>
                ) : (
                    tournaments.map(tournament => (
                        <Card key={tournament.id} className="relative group overflow-hidden">
                            <CardContent className="p-4 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{tournament.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(tournament.date), "yyyy/M/d")}</span>
                                        <span>•</span>
                                        <span>{tournament.format}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteTournament(tournament.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
