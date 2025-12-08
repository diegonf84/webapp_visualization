import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md active:scale-[0.98] focus-visible:ring-slate-400',
        primary:
          'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm hover:from-slate-800 hover:to-slate-700 hover:shadow-md active:scale-[0.98] focus-visible:ring-slate-400',
        secondary:
          'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow active:scale-[0.98] focus-visible:ring-slate-300',
        ghost:
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300',
        accent:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md active:scale-[0.98] focus-visible:ring-amber-400',
        outline:
          'border-2 border-slate-900 text-slate-900 bg-transparent hover:bg-slate-900 hover:text-white active:scale-[0.98] focus-visible:ring-slate-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
