import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GrindOS Boundary Caught]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocal = () => {
    try {
      localStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <Card className="max-w-md w-full border border-destructive/30 shadow-lg">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <AlertCircle className="size-7" />
              </div>

              <div>
                <h2 className="text-lg font-bold font-serif tracking-tight text-foreground">
                  Unexpected Execution Interruption
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  GrindOS encountered an unhandled exception. Your local solve progress is safe.
                </p>
                {this.state.error && (
                  <div className="mt-3 p-2.5 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground text-left max-h-24 overflow-y-auto">
                    {this.state.error.message}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 w-full pt-2">
                <Button onClick={this.handleReload} className="flex-1 text-xs h-9.5 gap-2">
                  <RotateCcw className="size-3.5" />
                  <span>Reload App</span>
                </Button>
                <Button variant="outline" onClick={this.handleResetLocal} className="text-xs h-9.5 text-destructive border-destructive/30">
                  Reset Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
