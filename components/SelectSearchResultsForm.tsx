import { useState } from 'react'
import { GitUser, commitAndPr, createBranchName } from '@/utils/git_helpers'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { GrepResult } from "@/utils/git_helpers"
import { Button } from './ui/button'

interface DataTableProps<TData> {
    data: GrepResult[]
    gitUser: GitUser
    find: string,
    replace: string,
    setPRUrl: (url: string | null) => void
}

interface RowSelection {
    [key: number]: boolean;
}
export function SelectSearchResultsTable<TData>({
    data,
    gitUser,
    find,
    replace,
    setPRUrl,
}: DataTableProps<TData>) {

    const [rowSelection, setRowSelection] = useState<RowSelection>({})

    const handleCommitAndPr = async () => {

        const selectedChanges = Object.keys(rowSelection)
            .filter((key) => rowSelection[parseInt(key)])
            .map((key) => data[parseInt(key)]);

        if (selectedChanges.length === 0) {
            return null
        }



        const pullRequestUrl = await commitAndPr(gitUser, find, replace, selectedChanges);

        if (pullRequestUrl) {
            console.log(`Pull request created successfully: ${pullRequestUrl}`);
            setPRUrl(pullRequestUrl)
        } else {
            console.log('Failed to create pull request.');
        }
    };

    const columns: ColumnDef<GrepResult>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },

        {
            accessorKey: "line_number",
            header: "Line Number",
        },
        {
            accessorKey: "filename",
            header: "File Name",
        },
        {
            accessorKey: "line_content",
            header: "Line Content",
        },
    ]

    function setRow(value) {
        setRowSelection(value)
    }


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRow,
        state: { rowSelection }
    })

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
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
                                    )
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
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            <Button
                onClick={handleCommitAndPr}
                className="w-72"
                disabled={false}
            >
                Commit and Create Pull Request
            </Button>
        </>

    )
}
