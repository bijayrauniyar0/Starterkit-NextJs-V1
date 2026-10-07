"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Header,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/primitives/checkbox";
import { Skeleton } from "@/components/primitives/skeleton";
import { FlexRow } from "@/components/ui/layouts";
import { useInfiniteScrollQuery } from "@/lib/api-client/infiniteQuery";
import { cn } from "@/utils/cn";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../primitives/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  path?: string;
  queryParams?: Record<string, any>;
  pathParams?: Record<string, string | number>;
  className?: string;
  containerClassName?: string;
  resourceKey?: string;
  enableColumnResizing?: boolean | (keyof TData)[];
  enableColumnReordering?: boolean;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  path,
  queryParams,
  pathParams,
  className,
  containerClassName,
  resourceKey,
  enableColumnResizing = false,
  enableColumnReordering = false,
  enableRowSelection = false,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const { flatData, ...query } = useInfiniteScrollQuery<TData>({
    path: path!,
    pathParams,
    queryParams: {
      ...queryParams,
      ...(sorting.length
        ? { ordering: `${sorting[0].desc ? "-" : ""}${sorting[0].id}` }
        : {}),
    },
    options: {
      queryKey: [
        "data-table",
        resourceKey,
        queryParams,
        pathParams,
        sorting,
        path,
      ],
      enabled: !!path,
    },
  });

  const tableData = data ?? flatData ?? [];

  const finalColumns = useMemo(() => {
    const processedColumns = columns.map((col) => {
      // Safely determine column ID without 'any'
      const colId =
        col.id ||
        ("accessorKey" in col ? (col.accessorKey as string) : undefined);
      let canResize = false;

      if (enableColumnResizing === true) {
        canResize = true;
      } else if (Array.isArray(enableColumnResizing)) {
        if (colId) {
          canResize = (enableColumnResizing as string[]).includes(colId);
        }
      }

      return {
        ...(col as any),
        id: colId,
        enableResizing: canResize,
      };
    });

    if (!enableRowSelection) return processedColumns;

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-white dark:border-white"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    };

    return [selectionColumn, ...processedColumns] as ColumnDef<TData, TValue>[];
  }, [columns, enableRowSelection, enableColumnResizing]);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    finalColumns.map((c) => c.id!),
  );

  // Sync column order if columns change (e.g. selection enabled/disabled)
  useEffect(() => {
    const newIds = finalColumns.map((c) => c.id!);
    setColumnOrder((prev) => {
      // If the set of IDs changed (e.g. selection column added/removed), reset order
      const prevOrder = prev || [];
      if (
        prevOrder.length !== newIds.length ||
        !newIds.every((id) => prevOrder.includes(id))
      ) {
        return newIds;
      }
      return prev;
    });
  }, [finalColumns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
      columnOrder,
    },
    enableColumnResizing: !!enableColumnResizing,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const nextSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(nextSelection);
      onRowSelectionChange?.(nextSelection);
    },
    onColumnOrderChange: setColumnOrder,
    getSortedRowModel: getSortedRowModel(),
  });

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border",
        containerClassName,
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDragId(null)}
      >
        <Table
          className={cn(
            "relative min-w-full border-collapse border-0",
            enableColumnResizing || enableColumnReordering ? "table-fixed" : "",
            className,
          )}
          containerClassName={cn(
            activeDragId ? "overflow-hidden" : "overflow-x-auto",
          )}
          style={{
            width: enableColumnResizing ? table.getTotalSize() : "100%",
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-primary">
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <DraggableTableHeader
                        key={header.id}
                        header={header}
                        enableColumnReordering={enableColumnReordering}
                      />
                    );
                  })}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {query?.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {finalColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "truncate overflow-hidden py-4 whitespace-nowrap last:border-0",
                          cell.column.getCanResize() &&
                            cell.column.getIsResizing() &&
                            "border-r-accent-foreground/60 border-r-2",
                        )}
                        style={{
                          width: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {query?.isFetchingNextPage &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      {finalColumns.map((_, j) => (
                        <TableCell key={j} className="py-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {query?.hasNextPage && (
                  <TableRow>
                    <TableCell
                      colSpan={finalColumns.length}
                      className="p-0 py-4"
                    >
                      <div ref={query.loadMoreRef} className="h-1" />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}

interface DraggableTableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>;
  enableColumnReordering: boolean;
}

function DraggableTableHeader<TData, TValue>({
  header,
  enableColumnReordering,
}: DraggableTableHeaderProps<TData, TValue>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
    disabled: !enableColumnReordering || header.id === "select",
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.getSize(),
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  const isSorted = header.column.getIsSorted();

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-primary sticky top-0 z-10 shadow-sm transition-colors",
        header.column.getCanResize() &&
          "border-r-accent-foreground/60 border-r last:border-0",
        header.column.getIsResizing() &&
          "border-r-accent-foreground/60 cursor-col-resize border-r-2",
      )}
    >
      <FlexRow className="group text-background items-center">
        {enableColumnReordering && header.id !== "select" && (
          <div
            {...attributes}
            {...listeners}
            className="mr-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="size-4 opacity-50 group-hover:opacity-100" />
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 items-center overflow-hidden",
            header.column.getCanSort() && "cursor-pointer select-none",
          )}
          onClick={header.column.getToggleSortingHandler()}
        >
          <div className="truncate">
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </div>
          {header.column.getCanSort() && (
            <div className="ml-2 flex shrink-0 flex-col">
              <ChevronUp
                fill="currentColor"
                className={cn(
                  "size-3",
                  isSorted === "asc" ? "opacity-100" : "opacity-30",
                )}
              />
              <ChevronDown
                fill="currentColor"
                className={cn(
                  "size-3",
                  isSorted === "desc" ? "opacity-100" : "opacity-30",
                )}
              />
            </div>
          )}
        </div>

        {header.column.getCanResize() && (
          <div
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            className={cn(
              "absolute top-0 right-0 h-full w-4 cursor-col-resize touch-none select-none",
            )}
          />
        )}
      </FlexRow>
    </TableHead>
  );
}
