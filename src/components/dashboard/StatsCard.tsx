import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold';
  index?: number;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  index = 0 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg",
        variant === 'primary' && "bg-gradient-primary text-primary-foreground border-transparent",
        variant === 'gold' && "bg-gradient-gold text-accent-foreground border-transparent",
        variant === 'default' && "bg-card border-border hover:border-primary/20"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative">
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
          variant === 'primary' && "bg-primary-foreground/20",
          variant === 'gold' && "bg-accent-foreground/20",
          variant === 'default' && "bg-primary/10"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === 'default' && "text-primary"
          )} />
        </div>

        <p className={cn(
          "text-sm font-medium mb-1",
          variant === 'default' && "text-muted-foreground"
        )}>
          {title}
        </p>

        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-heading font-bold tracking-tight">
            {value}
          </h3>
          {trend && (
            <span className={cn(
              "text-xs font-medium mb-1 px-1.5 py-0.5 rounded",
              trend.isPositive 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {subtitle && (
          <p className={cn(
            "text-sm mt-1",
            variant === 'default' ? "text-muted-foreground" : "opacity-80"
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
