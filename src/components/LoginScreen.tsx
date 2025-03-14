
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { PackageIcon, Mail } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary">
      <Card className="w-full max-w-md shadow-lg animate-fade-in bg-white/90 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <PackageIcon size={60} className="text-primary" />
              <Mail size={30} className="text-accent absolute -top-2 -right-2" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Package Pigeon</CardTitle>
          <CardDescription className="text-lg">
            Track all your packages from your Gmail inbox in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center px-8">
          <p className="text-muted-foreground">
            Connect your Gmail account to automatically find and track packages from your emails.
          </p>
          <div className="flex flex-col gap-2 mt-8">
            <Button 
              onClick={signInWithGoogle} 
              disabled={isLoading}
              size="lg"
              className="gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 w-3 bg-white/20 skew-x-[20deg] group-hover:w-full transform-gpu transition-all duration-300 ease-in-out -z-10"></div>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032
                  s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2
                  C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              {isLoading ? "Connecting..." : "Connect with Google"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <p>
            This app scans your Gmail for package tracking information.
          </p>
          <p className="text-xs">
            Demo Mode: No actual Gmail connection in this demo.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginScreen;
