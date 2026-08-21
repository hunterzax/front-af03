import TableTabTotal from "./form/tableTabTotal";
import SearchInput from "@/components/other/searchInput";

type Props = {
    dataCurrent?: any;
    dataTotal?: any;
    permission: any
    columnVisibility: any
    setcolumnVisibility: any
    loading: boolean
};

const TabtotalDetail: React.FC<Props> = ({
    dataCurrent = [],
    dataTotal = [],
    permission,
    columnVisibility,
    setcolumnVisibility,
    loading = false
}) => {

    const searchCurrentTime = (query: string) => {
        const queryLower = query.replace(/\s+/g, '').toLowerCase().trim();
    }

    const searchTotal = (query: string) => {
        const queryLower = query.replace(/\s+/g, '').toLowerCase().trim();
    }

    return (
        <div>
            <div className="bg-red-500 text-xl font-bold">{'NEW'}</div>
            <div className="flex justify-between">
                <div></div>
                <div><SearchInput onSearch={searchCurrentTime} /></div>
            </div>
            <TableTabTotal
                tableDataCurrent={dataCurrent}
                isLoading={loading}
                columnVisibility={columnVisibility}
                userPermission={permission}
                tableType={'current'}
                autoHeight={true}
            />

            <TableTabTotal
                tableDataAll={dataTotal}
                isLoading={loading}
                columnVisibility={columnVisibility}
                userPermission={permission}
                tableType={'all'}
            />
        </div>
    )
}

export default TabtotalDetail;