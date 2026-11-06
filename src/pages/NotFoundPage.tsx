import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <Card className="max-w-md w-full border border-border/80 shadow-md">
        <CardContent className="p-8 flex flex-col items-center text-center gap-5">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-2xl">
            404
          </div>

          <div>
            <h1 className="text-xl font-bold font-serif tracking-tight text-foreground">
              Mission Not Found
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              The algorithmic path or screen you requested does not exist in GrindOS.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full pt-2">
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full text-xs h-9.5 gap-2">
                <LayoutDashboard className="size-4" />
                <span>Return to Dashboard</span>
              </Button>
            </Link>

            <Link to="/curriculum">
              <Button variant="outline" className="text-xs h-9.5 gap-1.5">
                <ArrowLeft className="size-3.5" />
                <span>Syllabus</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
