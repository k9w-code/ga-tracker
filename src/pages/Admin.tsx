import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Trash2, Shield, ShieldAlert, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface UserSecret {
    id: string;
    email: string;
    last_sign_in_at: string | null;
    created_at: string;
}

interface AdminUser {
    id: string;
    email: string;
    created_at: string;
}

export default function Admin() {
    const [users, setUsers] = useState<UserSecret[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newAdminId, setNewAdminId] = useState("");
    const navigate = useNavigate();
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            navigate("/login");
            return;
        }

        setCurrentUserEmail(user.email);

        // Check against ga_admins table
        const { data, error } = await supabase
            .from('ga_admins')
            .select('email')
            .eq('email', user.email)
            .single();

        if (error || !data) {
            // Not an admin
            setLoading(false);
            return;
        }

        setIsAdmin(true);
        fetchData();
        setLoading(false);
    };

    const fetchData = async () => {
        // Fetch all users using RPC
        const { data: usersData, error: usersError } = await supabase
            .rpc('ga_get_all_users_secrets');

        if (usersError) {
            console.error("Error fetching users:", usersError);
        } else {
            setUsers(usersData || []);
        }

        // Fetch admins
        const { data: adminsData, error: adminsError } = await supabase
            .from('ga_admins')
            .select('*')
            .order('created_at', { ascending: true });

        if (adminsError) {
            console.error("Error fetching admins:", adminsError);
        } else {
            setAdmins(adminsData || []);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminId) return;

        // Convert input ID to email format
        const email = `${newAdminId.toLowerCase()}@anonymous.ga`;

        const { error } = await supabase
            .from('ga_admins')
            .insert([{ email }]);

        if (error) {
            alert("管理者の追加に失敗しました: " + error.message);
        } else {
            setNewAdminId("");
            fetchData();
        }
    };

    const handleDeleteAdmin = async (email: string) => {
        if (email === currentUserEmail) {
            alert("自分自身の管理者権限は削除できません。");
            return;
        }

        if (!confirm(`本当に ${email.replace("@anonymous.ga", "")} から管理者権限を剥奪しますか？`)) {
            return;
        }

        const { error } = await supabase
            .from('ga_admins')
            .delete()
            .eq('email', email);

        if (error) {
            alert("削除に失敗しました: " + error.message);
        } else {
            fetchData();
        }
    };

    const getDisplayId = (email: string) => {
        return email.replace("@anonymous.ga", "");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-4">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold">アクセス権限がありません</h1>
                <p className="text-muted-foreground">このページを表示するには管理者権限が必要です。</p>
                <Button onClick={() => navigate("/")}>ホームに戻る</Button>
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        getDisplayId(user.email).includes(searchTerm.toLowerCase()) ||
        user.email.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-20 animate-fade-in">
            <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-bold text-lg">Admin Panel</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                        アプリに戻る
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* Admins Management */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        管理者管理
                    </h2>
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-base">現在の管理者</CardTitle>
                            <CardDescription>
                                以下のユーザーは全てのデータにアクセス可能です。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {admins.map(admin => (
                                    <div key={admin.id} className="flex items-center justify-between p-3 bg-black/20 rounded-md border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <User className="h-4 w-4 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{getDisplayId(admin.email)}</div>
                                                <div className="text-xs text-muted-foreground">ID: {admin.id}</div>
                                            </div>
                                        </div>
                                        {admin.email !== currentUserEmail && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-400"
                                                onClick={() => handleDeleteAdmin(admin.email)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {admin.email === currentUserEmail && (
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">You</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-white/10">
                                <Input
                                    placeholder="追加する管理者ID (例: maikeru)"
                                    value={newAdminId}
                                    onChange={(e) => setNewAdminId(e.target.value)}
                                    className="bg-black/20"
                                />
                                <Button onClick={handleAddAdmin} disabled={!newAdminId}>
                                    追加
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Users List */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400" />
                            全ユーザー一覧 ({users.length})
                        </h2>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="IDで検索..."
                            className="pl-10 bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-3">
                        {filteredUsers.map(user => (
                            <Card key={user.id} className="bg-white/5 border-white/10 overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="font-bold text-blue-400 text-lg">
                                                {getDisplayId(user.email).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{getDisplayId(user.email)}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <div>登録: {format(new Date(user.created_at), "yyyy/MM/dd")}</div>
                                        <div>最終: {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "yyyy/MM/dd HH:mm") : "N/A"}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground opacity-50">
                                ユーザーが見つかりません
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
