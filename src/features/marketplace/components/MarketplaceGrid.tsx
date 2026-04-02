interface MarketplaceGridProps { children: React.ReactNode; }

export default function MarketplaceGrid({ children }: MarketplaceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
