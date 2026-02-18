import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Swords, Trophy, BarChart2, LogOut, User } from "lucide-react";
import { cn } from "../../utils/cn";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [userDisplayId, setUserDisplayId] = useState<string | null>(null);

    const getDisplayId = (email?: string | null) => {
        if (!email) return null;
        return email.replace("@anonymous.ga", "");
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserDisplayId(getDisplayId(user?.email));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserDisplayId(getDisplayId(session?.user?.email));
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const navItems = [
        { label: "ホーム", icon: Home, path: "/" },
        { label: "対戦", icon: Swords, path: "/play" },
        { label: "デッキ", icon: Layers, path: "/decks" },
        { label: "履歴", icon: Trophy, path: "/matches" },
        { label: "統計", icon: BarChart2, path: "/stats" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-16">
            <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Swords className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Grand Archive Tracker</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        {userDisplayId && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mr-2">
                                <User className="h-3 w-3" />
                                <span className="max-w-[100px] truncate">{userDisplayId}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
                            title="ログアウト"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-50">
                <div className="max-w-md mx-auto flex justify-around items-center h-16 px-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center space-y-1 transition-all",
                                    isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
