import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-900 text-white hover:bg-slate-800',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
        outline: 'text-slate-900 border border-slate-200 bg-white',
        success:
          'border-transparent bg-emerald-100 text-emerald-800',
        warning:
          'border-transparent bg-amber-100 text-amber-800',
        info:
          'border-transparent bg-sky-100 text-sky-800',
        destructive:
          'border-transparent bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
