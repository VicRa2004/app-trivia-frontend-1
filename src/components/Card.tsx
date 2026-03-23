import React from 'react';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface text-text-main shadow-sm flex flex-col overflow-hidden ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pb-4 flex flex-col space-y-1.5 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={`text-2xl font-bold leading-none tracking-tight ${className || ''}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-text-muted ${className || ''}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pt-0 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pt-0 flex items-center ${className || ''}`} {...props}>
      {children}
    </div>
  );
};
