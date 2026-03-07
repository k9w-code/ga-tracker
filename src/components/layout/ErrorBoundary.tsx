import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-red-500">申し訳ありません。エラーが発生しました。</h1>
                        <pre className="text-xs text-muted-foreground bg-white/5 p-4 rounded overflow-auto max-w-lg">
                            {this.state.error?.message}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary rounded-md font-bold"
                        >
                            再読み込み
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
