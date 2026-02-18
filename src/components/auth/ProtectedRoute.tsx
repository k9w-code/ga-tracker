import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
