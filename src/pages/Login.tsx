import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { LogIn, User, Lock, Info } from "lucide-react";

export default function Login() {
    const [playerId, setPlayerId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (playerId.length < 3 || password.length < 6) {
            setMessage({ type: 'error', text: "IDは3文字以上、パスワードは6文字以上で入力してください。" });
            return;
        }

        setLoading(true);
        setMessage(null);

        // 内部的には id@anonymous.ga という形式でメールアドレスとして扱う
        const fakeEmail = `${playerId.toLowerCase()}@anonymous.ga`;

        // 1. まずはサインインを試みる
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: password,
        });

        if (signInError) {
            // ユーザーが見つからない場合は新規登録を試みる
            if (signInError.message.includes("Invalid login credentials")) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: fakeEmail,
                    password: password,
                });

                if (signUpError) {
                    setMessage({ type: 'error', text: "登録に失敗しました: " + signUpError.message });
                } else {
                    setMessage({ type: 'success', text: "アカウントを新規作成してログインしました！" });
                }
            } else {
                setMessage({ type: 'error', text: "ログインエラー: " + signInError.message });
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background animate-fade-in">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

            <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />

                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2 animate-bounce-slow">
                        <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Grand Archive Tracker</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        個人情報を一切使わずにデータを管理。
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">プレイヤー ID</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="好きなIDを入力 (例: ga_master)"
                                    className="pl-10 h-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                                    value={playerId}
                                    onChange={(e) => setPlayerId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">パスワード</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="6文字以上のパスワード"
                                    className="pl-10 h-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md text-xs font-medium animate-slide-up ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? "通信中..." : "ログイン / 新規登録"}
                        </Button>
                    </form>

                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3 text-xs leading-relaxed">
                        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-muted-foreground">
                            <p className="font-semibold text-blue-400 mb-1">プライバシーについて</p>
                            メールアドレスは不要です。入力したIDとパスワードは他の端末からデータを同期する際にのみ使用されます。パスワードを忘れると復旧できないため、大切に保管してください。
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
