import React from 'react';

interface MarketplaceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="mb-8 flex flex-wrap justify-between items-center">
      <div className="w-full md:w-auto mb-4 md:mb-0">
        <input
          type="text"
          placeholder="Search by Token ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Items</option>
          <option value="forSale">For Sale</option>
          <option value="mySales">My Sales</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="price">Sort by Price</option>
          <option value="tokenId">Sort by Token ID</option>
        </select>
      </div>
    </div>
  );
};

export default MarketplaceFilters