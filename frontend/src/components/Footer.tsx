import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md gradient-bg flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">PathForge AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Transform your career with AI-powered learning paths tailored to your unique skills and goals.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">About</li>
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">Privacy</li>
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">Terms</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">Contact</li>
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">FAQ</li>
              <li className="hover:text-foreground cursor-pointer transition-colors duration-150">Documentation</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6">
          <p className="text-xs text-muted-foreground">© 2024 PathForge AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
