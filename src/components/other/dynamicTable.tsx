// components/DynamicTable.tsx
import React from 'react';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

type Column = {
  key: string;
  label: string;
  sortable?: boolean;
  customRender?: (value: any, row: any) => React.ReactNode;
};

type GroupedColumn = {
  label: string;
  columns: Column[];
};

type DynamicTableProps = {
  columns: (Column | GroupedColumn)[];
  data: any[];
  isEditing: boolean;
  onInputChange: (key: string, value: string, rowIndex: number) => void;
  actions?: (row: any) => React.ReactNode;
};

const DynamicTable: React.FC<DynamicTableProps> = ({ columns, data, isEditing, onInputChange, actions }) => {
  const [sortState, setSortState] = React.useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortState.key === key && sortState.direction === 'asc') {
      direction = 'desc';
    } else if (sortState.key === key && sortState.direction === 'desc') {
      direction = null;
    }

    setSortState({ key, direction });

    if (direction) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      data = sortedData; // Replace the data with sorted data
    }
  };

  const getArrowIcon = (key: string) => {
    if (sortState.key === key) {
      return sortState.direction === 'asc' ? (
        <KeyboardArrowUpIcon className="inline-block w-4 h-4" />
      ) : (
        <KeyboardArrowDownIcon className="inline-block w-4 h-4" />
      );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-white bg-[#1473A1] sticky top-0 z-10">
          <tr className="h-9">
            {columns.map((col) =>
              'columns' in col ? (
                <th key={col.label} colSpan={col.columns.length} className="text-center px-4 py-2 border border-[#08567C]">
                  {col.label}
                </th>
              ) : (
                <th key={col.key} className="px-4 py-2" />
              )
            )}
            <th scope="col" className="px-4 py-2" />
          </tr>
          <tr className="h-9">
            {columns.flatMap((col) =>
              'columns' in col ? (
                col.columns.map((subCol) => (
                  <th
                    key={subCol.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-2  border border-[#08567C]"
                  >
                    {subCol.label}
                  </th>
                ))
              ) : (
                <th
                  key={col.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2 "
                >
                  {col.label}
                </th>
              )
            )}
            {/* {actions && <th scope="col" className="px-4 py-2">Actions</th>} */}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`border-b ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12`}
            >
              {columns.flatMap((col) =>
                'columns' in col ? (
                  col.columns.map((subCol) => (
                    <td key={subCol.key} className="px-4 py-2 text-gray-700">
                      {isEditing && (subCol.key === 'min1' || subCol.key === 'max1') ? (
                        <input
                          type="text"
                          value={row[subCol.key]}
                          onChange={(e) => onInputChange(subCol.key, e.target.value, rowIndex)}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        subCol.customRender ? subCol.customRender(row[subCol.key], row) : row[subCol.key]
                      )}
                    </td>
                  ))
                ) : (
                  <td key={col.key} className="px-4 py-2 text-gray-700">
                    {isEditing && (col.key === 'min1' || col.key === 'max1') ? (
                      <input
                        type="text"
                        value={row[col.key]}
                        onChange={(e) => onInputChange(col.key, e.target.value, rowIndex)}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      col.customRender ? col.customRender(row[col.key], row) : row[col.key]
                    )}
                  </td>
                )
              )}
              {/* {actions && (
                <td className="px-4 py-2">
                  {actions(row)}
                </td>
              )} */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
