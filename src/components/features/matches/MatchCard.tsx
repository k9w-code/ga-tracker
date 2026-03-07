import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash2, MapPin, Calendar } from "lucide-react";
import { cn } from "../../../utils/cn";
import { format } from "date-fns";
import type { Match, Deck } from "../../../types";

interface MatchCardProps {
    match: Match;
    deck?: Deck;
    onEdit: (match: Match) => void;
    onDelete: (id: string) => void;
}

export function MatchCard({ match, deck, onEdit, onDelete }: MatchCardProps) {
    return (
        <div className="relative group">
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-md z-10",
                match.result === 'win' ? "bg-green-500" : match.result === 'loss' ? "bg-red-500" : "bg-yellow-500"
            )} />
            <Card className="pl-2 border-l-0 overflow-hidden bg-card border-border">
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
                                <div key={i} className="flex items-center bg-muted/50 dark:bg-white/5 px-1.5 py-0.5 rounded text-[9px] border border-border">
                                    <span className="opacity-60 mr-1">{i + 1}:</span>
                                    <span className={cn("font-bold mr-1", g.result === 'win' ? "text-green-400" : g.result === 'loss' ? "text-red-400" : "text-yellow-400")}>
                                        {g.result === 'win' ? 'W' : g.result === 'loss' ? 'L' : 'D'}
                                    </span>
                                    <span className="opacity-60 text-[8px]">{g.first ? '先' : '後'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {deck?.name || "不明なデッキ"}
                        </div>
                        {match.notes && (
                            <div className="text-xs mt-1 px-2 py-1 bg-muted/50 dark:bg-white/5 border border-border rounded text-muted-foreground break-all">
                                {match.notes}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white"
                            onClick={() => onEdit(match)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                            onClick={() => {
                                if (confirm("この対戦記録を削除してもよろしいですか？")) {
                                    onDelete(match.id);
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
}
