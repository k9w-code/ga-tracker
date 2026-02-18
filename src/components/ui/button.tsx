import * as React from "react"
import { cn } from "../../utils/cn"

// Since I didn't install class-variance-authority via npm (missed it in deps list), 
// I will implement a simpler version or just install it quickly.
// Wait, I should stick to the plan. I didn't install cva.
// So I will just use cn and props.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            destructive: "bg-red-500 text-white hover:bg-red-600",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        };

        const sizes = {
            sm: "h-9 px-3 text-xs rounded-md",
            md: "h-10 px-4 py-2 rounded-md",
            lg: "h-11 px-8 rounded-md",
            icon: "h-10 w-10 p-2 rounded-md flex items-center justify-center"
        };

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform";

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
