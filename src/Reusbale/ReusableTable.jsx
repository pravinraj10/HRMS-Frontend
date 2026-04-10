import React, { useRef, useEffect } from "react";

const ReusableTable = ({ columns, data, isFetching, onLoadMore }) => {
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = tableContainerRef.current;

    const handleScroll = () => {
      if (!scrollContainer) return;

      const { scrollTop, clientHeight, scrollHeight } = scrollContainer;
      if (scrollTop + clientHeight >= scrollHeight - 50 && !isFetching) {
        if (onLoadMore) {
          onLoadMore();
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isFetching, onLoadMore]);

  return (
    <div className="bg-white border position-relative overflow-auto rt-container" ref={tableContainerRef}>
      <table className="w-100 text-center text-nowrap rt-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="text-white fw-semibold text-capitalize rt-th">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="rt-tr">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`fw-medium align-middle rt-td ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {isFetching &&
            [...Array(3)].map((_, skeletonRowIndex) => (
              <tr key={`skeleton-${skeletonRowIndex}`}>
                {columns.map((_, skeletonColIndex) => (
                  <td key={`skeleton-col-${skeletonColIndex}`} className="align-middle rt-td">
                    <div className="rt-shimmer rt-skeleton-cell"></div>
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      <style>{`
        .rt-container {
          border-color: #e2e8f0 !important;
          border-radius: 12px; 
          margin-top: 10px;
          max-height: calc(100vh - 350px); 
          scrollbar-width: none; 
          -ms-overflow-style: none;  
        }

        .rt-container::-webkit-scrollbar {
          display: none;
        }

        .rt-table {
          border-collapse: separate; 
          border-spacing: 0;
        }

        .rt-th {
          position: sticky;
          top: 0;
          background-color: #1a56a6; 
          z-index: 10; 
          padding: 16px;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .rt-td {
          padding: 18px 16px; 
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #475569;
        }

        .rt-table tr:last-child .rt-td {
          border-bottom: none;
        }

        .rt-tr:hover {
          background-color: #f8fafc; 
        }

        .rt-td.text-blue {
          color: #4F7094;
          font-family: 'Inter', sans-serif;
          font-weight: 400 !important;
        }

        @media screen and (max-width: 768px) {
          .rt-th {
            padding: 12px 10px;
            font-size: 13px;
          }
          .rt-td {
            padding: 14px 10px;
            font-size: 13px;
          }
          .rt-container {
            max-height: calc(100vh - 300px);
          }
        }

        @media screen and (max-width: 480px) {
          .rt-th {
            padding: 10px 8px;
            font-size: 12px; 
          }
          .rt-td {
            padding: 12px 8px;
            font-size: 11px; 
          }
          .rt-container {
            border-radius: 8px;
            max-height: calc(100vh - 250px);
          }
          .rt-skeleton-cell {
            height: 15px;
          }
        }

        .rt-skeleton-cell {
          height: 20px;
          width: 80%;
          margin: 0 auto;
          border-radius: 4px;
        }

        .rt-shimmer {
          background: #f6f7f8;
          background-image: linear-gradient(
            to right,
            #f6f7f8 0%,
            #edeef1 20%,
            #f6f7f8 40%,
            #f6f7f8 100%
          );
          background-repeat: no-repeat;
          background-size: 800px 100%;
          animation: placeholderShimmer 1.5s linear infinite forwards;
        }

        @keyframes placeholderShimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
      `}</style>
    </div>
  );
};

export default ReusableTable;