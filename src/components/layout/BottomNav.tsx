import { Home, Layers, Trophy, BarChart2, Sword } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

export function BottomNav() {
    const location = useLocation();

    const navItems = [
        { label: "Home", icon: Home, path: "/" },
        { label: "Decks", icon: Layers, path: "/decks" },
        { label: "Events", icon: Trophy, path: "/tournaments" },
        { label: "Matches", icon: Sword, path: "/matches" },
        { label: "Stats", icon: BarChart2, path: "/stats" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-lg pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "animate-pulse")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
