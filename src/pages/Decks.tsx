import { useState } from "react";
import { useDecks } from "../hooks/useDecks";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";

export default function Decks() {
    const { decks, addDeck, updateDeck, deleteDeck, loading } = useDecks();
    const [isAdding, setIsAdding] = useState(false);

    const [editingDeck, setEditingDeck] = useState<any | null>(null);
    const [name, setName] = useState("");
    const [hero, setHero] = useState<string>("");
    const [format, setFormat] = useState<string>("");
    const [decklistUrl, setDecklistUrl] = useState("");

    const handleEdit = (deck: any) => {
        setEditingDeck(deck);
        setName(deck.name);
        setHero(deck.hero);
        setFormat(deck.format);
        setDecklistUrl(deck.decklistUrl || "");
        setIsAdding(true);
    };

    const handleAddDeck = async () => {
        if (!name || !hero || !format) return;
        setLoadingAdd(true);
        await addDeck({ name, hero, format, decklistUrl });
        setName("");
        setHero("");
        setFormat("");
        setDecklistUrl("");
        setIsAdding(false);
        setLoadingAdd(false);
    };

    const handleUpdateDeck = async () => {
        if (!editingDeck || !name || !hero || !format) return;
        setLoadingAdd(true);
        await updateDeck(editingDeck.id, { name, hero, format, decklistUrl });
        setName("");
        setHero("");
        setFormat("");
        setDecklistUrl("");
        setIsAdding(false);
        setLoadingAdd(false);
    };

    const [loadingAdd, setLoadingAdd] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <header className="flex justify-between items-center sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
                <h1 className="text-2xl font-bold">マイデッキ</h1>
                <Button onClick={() => {
                    if (isAdding) {
                        setIsAdding(false);
                        setEditingDeck(null); // Clear editing deck
                        setName(""); // Clear name
                        setHero("");
                        setFormat("");
                        setDecklistUrl("");
                    } else {
                        setIsAdding(true);
                    }
                }} size="sm">
                    {isAdding ? "キャンセル" : (
                        <>
                            <Plus className="h-4 w-4 mr-1" />
                            デッキ登録
                        </>
                    )}
                </Button>
            </header>

            {isAdding && (
                <Card className="animate-slide-up border-primary/50">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {editingDeck ? "デッキを編集" : "新しいデッキを登録"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">フォーマット (例: Standard)</label>
                            <Input
                                placeholder="フォーマットを入力"
                                value={format}
                                onChange={(e) => setFormat(e.target.value.slice(0, 40))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">ヒーロー (例: Lorraine)</label>
                            <Input
                                placeholder="ヒーロー名を入力"
                                value={hero}
                                onChange={(e) => setHero(e.target.value.slice(0, 40))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">デッキ名</label>
                            <Input
                                placeholder="デッキ名 (例: Bravo CC)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Decklist URL (Shout At Your Decks)</label>
                            <Input
                                placeholder="https://shoutatyourdecks.com/decks/..."
                                value={decklistUrl}
                                onChange={(e) => setDecklistUrl(e.target.value)}
                            />
                        </div>

                        <Button className="w-full" onClick={editingDeck ? handleUpdateDeck : handleAddDeck} disabled={!name || !hero || !format || loadingAdd}>
                            {loadingAdd ? "処理中..." : (editingDeck ? "更新する" : "登録する")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {decks.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p>デッキが見つかりません。新しいデッキを登録しましょう！</p>
                    </div>
                ) : (
                    decks.map((deck) => (
                        <Card key={deck.id} className="relative group overflow-hidden">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{deck.name}</h3>
                                        {deck.decklistUrl && (
                                            <a
                                                href={deck.decklistUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary/80 transition-colors"
                                                title="Shout At Your Decks で開く"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{deck.hero} • {deck.format}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground"
                                        onClick={() => handleEdit(deck)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground"
                                        onClick={() => {
                                            if (confirm("このデッキを削除してもよろしいですか？関連するすべての対戦記録も削除されます。")) {
                                                deleteDeck(deck.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
