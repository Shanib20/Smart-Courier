import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, totalElements, onPageChange, pageSize = 10 }) => {
  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  if (totalPages <= 1 && totalElements <= pageSize) return null;

  return (
    <div className="pagination-premium-container">
      <span className="pagination-info">
        Showing <strong>{totalElements === 0 ? 0 : start} - {end}</strong> of <strong>{totalElements}</strong> results
      </span>
      <div className="pagination-controls-premium">
        <button 
          className="pagination-arrow-btn" 
          disabled={currentPage === 0} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="pagination-pages-list">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i} 
              className={`pagination-page-btn ${currentPage === i ? 'active' : ''}`}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button 
          className="pagination-arrow-btn" 
          disabled={currentPage >= totalPages - 1} 
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
