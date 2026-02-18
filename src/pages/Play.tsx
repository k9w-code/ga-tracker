import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Minus, RotateCcw, Play as PlayIcon, Pause } from "lucide-react";

interface TimerState {
    timeLeft: number;
    isActive: boolean;
    initialTime: number;
}

export default function Play() {
    // ライフカウンター状態
    const [p1Life, setP1Life] = useState(0);
    const [p2Life, setP2Life] = useState(0);

    // タイマー状態 (5分, 30分, 60分)
    const [timers, setTimers] = useState<Record<string, TimerState>>({
        "5m": { timeLeft: 5 * 60, isActive: false, initialTime: 5 * 60 },
        "30m": { timeLeft: 30 * 60, isActive: false, initialTime: 30 * 60 },
        "60m": { timeLeft: 60 * 60, isActive: false, initialTime: 60 * 60 }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(key => {
                    if (next[key].isActive && next[key].timeLeft > 0) {
                        next[key] = { ...next[key], timeLeft: next[key].timeLeft - 1 };
                        changed = true;
                    } else if (next[key].isActive && next[key].timeLeft === 0) {
                        next[key] = { ...next[key], isActive: false };
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleTimer = (key: string) => {
        setTimers(prev => ({
            ...prev,
            [key]: { ...prev[key], isActive: !prev[key].isActive }
        }));
    };

    const resetTimer = (key: string) => {
        setTimers(prev => ({
            ...prev,
            [key]: { ...prev[key], timeLeft: prev[key].initialTime, isActive: false }
        }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-primary/10">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    Play Session
                </h1>
            </header>

            {/* ライフカウンター */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-primary/5 py-3 text-center border-b border-primary/10">
                        <CardTitle className="text-sm font-bold text-primary">自分</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6 space-y-4">
                        <span className="text-6xl font-black text-foreground">{p1Life}</span>
                        <div className="flex gap-4">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary/10"
                                onClick={() => setP1Life(prev => Math.max(0, prev - 1))}
                            >
                                <Minus className="h-6 w-6" />
                            </Button>
                            <Button
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg"
                                onClick={() => setP1Life(prev => prev + 1)}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-secondary/5 py-3 text-center border-b border-secondary/10">
                        <CardTitle className="text-sm font-bold text-secondary-foreground">対戦相手</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6 space-y-4">
                        <span className="text-6xl font-black text-foreground">{p2Life}</span>
                        <div className="flex gap-4">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary/10"
                                onClick={() => setP2Life(prev => Math.max(0, prev - 1))}
                            >
                                <Minus className="h-6 w-6" />
                            </Button>
                            <Button
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg"
                                onClick={() => setP2Life(prev => prev + 1)}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* タイマー */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Game Timers</h2>
                <div className="grid gap-3">
                    {Object.entries(timers).map(([key, timer]) => (
                        <Card key={key} className={`glass-panel transition-all items-center flex justify-between p-4 ${timer.isActive ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-muted-foreground">{key === "5m" ? "5分" : key === "30m" ? "30分" : "60分"}</span>
                                <span className={`text-2xl font-black font-mono ${timer.timeLeft === 0 ? 'text-red-500 animate-pulse' : ''}`}>
                                    {formatTime(timer.timeLeft)}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => resetTimer(key)}
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    className={`rounded-full ${timer.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/80'}`}
                                    onClick={() => toggleTimer(key)}
                                >
                                    {timer.isActive ? <Pause className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 ml-0.5" />}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
