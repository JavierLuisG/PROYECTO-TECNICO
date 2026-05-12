import React from 'react';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

const MockLink = ({ href, children, className, ...rest }: LinkProps) => (
  <a href={href} className={className} {...rest}>
    {children}
  </a>
);

export default MockLink;
