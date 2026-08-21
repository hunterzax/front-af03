import { formatNumberTwoDecimalNom } from "@/utils/generalFormatter";
import { table_row_style } from "@/utils/styles";

interface ContractRowProps {
    dataTotal: any;
    columnVisibility?: any;
}

export const TariffTotalRow = ({
    dataTotal,
    columnVisibility,
}: ContractRowProps) => {

    return (
        <tr id={'tariff-total-row'} className={`${table_row_style}`}>
            {columnVisibility?.type_charge && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px]`}>{'TOTAL :'}</td>
            )}

            {columnVisibility?.contract_code && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {columnVisibility?.contract_type && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {columnVisibility?.quantity_operator && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {columnVisibility?.quantity && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {columnVisibility?.unit && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {/* {columnVisibility?.co_efficient && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )} */}

            {columnVisibility?.fee && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] `}>{''}</td>
            )}

            {columnVisibility?.amount_baht && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] text-right`}>{dataTotal ? formatNumberTwoDecimalNom(dataTotal?.amount) : ''}</td>
            )}

            {columnVisibility?.amount_operator_baht && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] text-right`}>{dataTotal ? formatNumberTwoDecimalNom(dataTotal?.amount_operator) : ''}</td>
            )}

            {columnVisibility?.amount_compare_baht && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] text-right`}>{dataTotal ? formatNumberTwoDecimalNom(dataTotal?.amount_compare) : ''}</td>
            )}

            {columnVisibility?.difference && (
                <td className={`px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] text-right`}>{dataTotal ? formatNumberTwoDecimalNom(dataTotal?.difference) : ''}</td>
            )}

            {columnVisibility.action && (
                <td className="px-2 py-1 text-[#1473A1] bg-[#00ADEF47] font-semibold min-w-[120px] ">{''}</td>
            )}
        </tr>
    );
};
