import React from 'react';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

const MockLink = ({ href, children, className }: LinkProps) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export default MockLink;
