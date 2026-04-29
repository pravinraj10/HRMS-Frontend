import React, { useRef, useEffect } from "react";
import "./ReusableTable.css";

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
              <th key={index} className={`text-white fw-semibold text-capitalize rt-th ${col.headerClassName || ""}`}>
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
    </div>
  );
};

export default ReusableTable;