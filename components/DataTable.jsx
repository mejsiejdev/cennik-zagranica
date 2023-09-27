"use client";

import * as React from "react";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { currencyMapping } from "@/lib/utils";
import { useState } from "react";

export function DataTable({ data, lang }) {
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [rowSelection, setRowSelection] = useState({});
	const [currentPage, setCurrentPage] = useState(1);

	const columns = [
		{
			accessorKey: "variantId",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="hover:bg-transparent p-0"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						ID
						<CaretSortIcon className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div className="capitalize">{row.getValue("variantId")}</div>,
		},
		{
			accessorKey: "sku",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="hover:bg-transparent p-0"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						SKU
						<CaretSortIcon className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div className="capitalize">{row.getValue("sku")}</div>,
		},
		{
			accessorKey: "ean",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="hover:bg-transparent p-0"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						EAN
						<CaretSortIcon className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div className="capitalize">{row.getValue("ean")}</div>,
		},
		{
			accessorKey: "brand",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="hover:bg-transparent p-0"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						BRAND
						<CaretSortIcon className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div className="capitalize">{row.getValue("brand")}</div>,
		},
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						className="hover:bg-transparent p-0"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						TITLE
						<CaretSortIcon className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => <div>{row.getValue("name")}</div>,
		},
		{
			accessorKey: "price",
			header: () => <div className="text-right pr-[16px]">PRICE</div>,
			cell: ({ row }) => {
				const amount = row.getValue("price");

				const setPrice = (item) => {
					const { newPrice, oldPrice } = item;
					const price = new Intl.NumberFormat(currencyMapping(lang).locale, {
						style: "currency",
						currency: currencyMapping(lang).currency,
					}).format(newPrice);

					if (newPrice > oldPrice)
						return {
							price: price + " ▲",
							style: "text-green-600",
						};
					if (newPrice < oldPrice)
						return {
							price: price + " ▼",
							style: "text-red-600",
						};
					return { price: price, style: "text-black pr-[16px]" };
				};

				return (
					<div className={`text-right font-medium ${setPrice(amount).style}`}>
						{setPrice(amount).price}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
	});

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter ID..."
					value={table.getColumn("variantId")?.getFilterValue() ?? ""}
					onChange={(event) =>
						table.getColumn("variantId")?.setFilterValue(event.target.value)
					}
					className="max-w-sm mr-4"
				/>

				<Input
					placeholder="Filter SKU..."
					value={table.getColumn("sku")?.getFilterValue() ?? ""}
					onChange={(event) => table.getColumn("sku")?.setFilterValue(event.target.value)}
					className="max-w-sm mr-4"
				/>

				<Input
					placeholder="Filter EAN..."
					value={table.getColumn("ean")?.getFilterValue() ?? ""}
					onChange={(event) => table.getColumn("ean")?.setFilterValue(event.target.value)}
					className="max-w-sm mr-4"
				/>
				<Input
					placeholder="Filter Brand..."
					value={table.getColumn("brand")?.getFilterValue() ?? ""}
					onChange={(event) =>
						table.getColumn("brand")?.setFilterValue(event.target.value)
					}
					className="max-w-sm mr-4"
				/>
				<Input
					placeholder="Filter Title..."
					value={table.getColumn("name")?.getFilterValue() ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="max-w-sm mr-4"
				/>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="uppercase"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow className="hover:bg-white" key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} found.
				</div>
				<div className="space-x-2">
					<div>
						Page {currentPage} of {table.getPageCount()}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setCurrentPage((prevState) => {
								return prevState - 1;
							});
							table.previousPage();
						}}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setCurrentPage((prevState) => {
								return prevState + 1;
							});
							table.nextPage();
						}}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
