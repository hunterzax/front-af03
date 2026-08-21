import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, PromiseLikeOfReactNode, Key } from "react";

const TableRow = (row:any) => {
    const cells:any = Object.values(row?.row);
    const tableCellClasses = "py-2 px-4 border-b border-border";
    
    return (
        <tr className="hover:bg-gray-100 transition duration-200">
            {
                cells.map((cell: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | Iterable<ReactNode> | null | undefined, index: Key | null | undefined) => (
                    <td key={index} className={tableCellClasses}>
                        {cell}
                    </td>
                ))
            }
        </tr>
    );

};

export default TableRow