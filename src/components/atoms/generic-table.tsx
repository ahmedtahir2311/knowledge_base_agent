import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  Cell,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Search,
} from "lucide-react";

interface GenericTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
}

// Helper function to safely convert values to string for CSV export
const valueToString = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (React.isValidElement(value)) return "React Element";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const GenericTable = <T,>({
  columns,
  data,
  isLoading = false,
}: GenericTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Add sorting capability to the table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  const generatePageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = columns
      .map((col) => String(col.header || col.id))
      .join(",");

    const rows = table
      .getRowModel()
      .rows.map((row) => {
        return row
          .getVisibleCells()
          .map((cell) => {
            // Handle different data types and escape commas
            const value = cell.getValue();
            const stringValue = valueToString(value);
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(",");
      })
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "table-data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='w-full max-w-full'>
      <div className='flex justify-between items-center mb-2'>
        <div className='relative w-full max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl bg-white text-primary focus:outline-none'
            placeholder='Search...'
          />
        </div>
        <button
          onClick={exportToCSV}
          className='flex items-center gap-2 px-3 py-2  hover:bg-opacity-80 rounded-md text-primary cursor-pointer'
        >
          <Download className='h-4 w-4' />
        </button>
      </div>

      <div className='w-full overflow-x-auto rounded-lg border border-primary'>
        <table className='w-full min-w-full table-auto'>
          <thead>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <tr key={headerGroup.id} className='bg-background text-center'>
                {headerGroup.headers.map((header: Header<T, unknown>) => (
                  <th
                    key={header.id}
                    className='px-4 py-3 text-primary font-medium border-b border-primary'
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <div className='flex items-center justify-center text-md font-bold'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-primary'>
            {table.getRowModel().rows.map((row: Row<T>) => (
              <tr key={row.id} className='bg-white text-center'>
                {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                  <td key={cell.id} className='px-4 py-3 text-primary'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-8 text-center text-primary'
                >
                  <div className='flex justify-center items-center'>
                    {isLoading ? (
                      <div className='flex items-center gap-2'>
                        <Loader2 className='h-5 w-5 animate-spin text-primary' />
                        <span>Loading data...</span>
                      </div>
                    ) : (
                      <p>No data available</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className='flex justify-between items-center mt-4 text-sm'>
        <div className='text-primary'>
          <p>
            Displaying{" "}
            {table.getRowModel().rows.length > 0
              ? `${
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                  1
                }-
              ${Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} of ${table.getFilteredRowModel().rows.length}`
              : "0"}{" "}
            results
          </p>
        </div>
        {totalPages > 1 && (
          <div className='flex items-center gap-1'>
            <button
              className={`p-1 rounded-md  border border-gray-100 ${
                !table.getCanPreviousPage()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label='Previous page'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>

            <div className='flex gap-1'>
              {generatePageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  className={`min-w-[2rem] h-8 rounded-md cursor-pointer ${
                    pageNumber === currentPage
                      ? "bg-[var(--color-primary)] text-white"
                      : ""
                  }`}
                  onClick={() => {
                    if (typeof pageNumber === "number") {
                      table.setPageIndex(pageNumber - 1);
                    }
                  }}
                  disabled={pageNumber === "..."}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              className={`p-1 rounded-md border border-gray-100 ${
                !table.getCanNextPage()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 cursor-pointer"
              }`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label='Next page'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericTable;
