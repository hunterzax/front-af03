import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CustomList from './customList';
import { putService } from '@/utils/postService';
import { InputSearch } from '@/components/other/SearchForm';
import { DialogTitle } from '@mui/material';

type TransferProps = {
    open: boolean;
    dataAreaContract: any;
    transferData: any;
    onClose: () => void;
};

const TransferListDialog: React.FC<TransferProps> = ({
    open,
    dataAreaContract,
    transferData,
    onClose
}) => {
    // const itemselectClass = "pl-[10px] text-[14px]"

    // Group ID > Contract Point ที่มาแสดงต้องกรองตาม End Date ของ point นั้นด้วย
    const area_name = dataAreaContract
        // ?.filter((item: any) => !item.end_date || new Date(item.end_date) >= new Date())
        ?.filter((item: any) =>
            (!item.end_date || new Date(item.end_date) >= new Date()) && item.contract_point?.length > 0
        )
        .map((item: any) => ({
            id: item.id,
            name: item.name,
            contract_point: item.contract_point
        }));

    const [checked, setChecked] = useState<any[]>([]);
    const [left, setLeft] = useState<any[]>([]);
    const [right, setRight] = useState<any[]>([]);
    const [leftSearch, setLeftSearch] = useState('');
    const [rightSearch, setRightSearch] = useState('');

    const [isClickTransfer, setIsClickTransfer] = useState<boolean>(false); // Audit log: v2.0.74 เข้าดู contract point ใน group id แต่ไม่ได้แก้ไขอะไร ขึ้น log manage shipper contract point https://app.clickup.com/t/86eujxj6t

    const intersection = (a: number[], b: number[]) => a.filter((value) => b?.indexOf(value) !== -1);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const [selectedOptions, setSelectedOptions] = useState<any>([]);
    const options: any = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
    const isAllSelected = selectedOptions.length === options.length;

    const handleToggle = (value: any) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const handleCheckedRight = () => {
        // >>> right
        // >>> leftChecked
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));

        setIsClickTransfer(true)
    };

    const handleCheckedLeft = () => {
        // >>> left
        // >>> rightChecked
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));

        setIsClickTransfer(true)

    };

    const not = (a: any[], b: any[]) => a.filter((value) => b.indexOf(value) === -1);

    const handleChange = (event: any) => {
        const value = event.target.value;

        // Check if 'all' is included in the selected value
        if (value.includes('all')) {
            const isAllSelected = selectedOptions.length === area_name.length;

            // If "Select All" is checked, select all options; otherwise, clear all
            const allSelectedIds = area_name?.map((item: any) => item.id);

            setSelectedOptions(isAllSelected ? [] : allSelectedIds);

            // Update left with all or no contract points based on selection
            const allContractPoints = isAllSelected
                ? []
                : dataAreaContract?.flatMap((area: any) =>
                    area.contract_point.map((point: any) => ({
                        id: point.id,
                        name: point.contract_point,
                    }))
                );

            const updatedLeft = allContractPoints?.filter(
                (leftItem: any) => !right?.some((rightItem: any) => rightItem.id === leftItem.id)
            );
            // setLeft(allContractPoints);
            setLeft(updatedLeft);
        } else {
            // Set selected options based on user selection
            setSelectedOptions(value);

            // Find the selected areas from the area_master
            const selectedAreas = dataAreaContract?.filter((area: any) =>
                value.includes(area.id)
            );

            // Extract contract points from selected areas and format them
            const contractPoints = selectedAreas?.flatMap((area: any) =>
                area?.contract_point?.map((point: any) => ({
                    id: point.id,
                    name: point.contract_point,
                }))
            ).filter((item1: any) =>
                !right?.some((item2: any) => item1?.id === item2?.id) // ปรับให้เลือกเฉพาะ id ที่ไม่ตรงกัน
            );

            setLeft(contractPoints);
        }
    };

    const updateContractPoint = async (dataput: any) => {

        if (transferData?.id && isClickTransfer) {
            const res_update_contract_point = await putService(`/master/account-manage/shipper-contract-point/${transferData?.id}`, dataput);
            setIsClickTransfer(false)
        } else {
            // no id
        }
    }

    useEffect(() => {
        let dataput = {
            contract_point: right?.map((item: any) => ({ id: item.id }))
        };

        if (dataput?.contract_point && dataput.contract_point.length >= 0 && open) {
            updateContractPoint(dataput);
        }
    }, [right])

    useEffect(() => {
        // อัพเดทของที่มีอยุ่แล้วลง right
        const right = transferData?.shipper_contract_point?.map((item: any) => ({
            id: item.contract_point.id,
            name: item.contract_point.contract_point,
        }));
        setRight(right);
        // const updatedLeft = left.filter(
        //     (leftItem) => !right.some((rightItem: any) => rightItem.id === leftItem.id)
        // );
    }, [transferData && transferData?.shipper_contract_point?.length > 0])

    useEffect(() => {
        if (open == false) {
            setTimeout(() => {
                setRight([]);
                setChecked([]);
                setSelectedOptions([]);
                setLeft([]);
                setLeftSearch('')
                setRightSearch('')
            }, 100);
        }
    }, [open])

    const handleClose = () => {
        // clear right
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-50">
                {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
                <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
                <div className="fixed inset-0 flex items-center justify-center ">
                    <DialogPanel
                        transition
                        className=" w-auto transform transition-all bg-white inset-0 rounded-[14px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 p-4"
                    >
                        <DialogTitle className="text-xl p-4 font-bold text-[#00ADEF] ">{"Configure Contract Points"}</DialogTitle>

                        <div className="w-[180px] ml-4 -mb-3 !pt-4">
                            <InputSearch
                                id="searcharea"
                                label="Areas"
                                // type="select"
                                type="select-multi-checkbox"
                                value={selectedOptions}
                                onChange={(e) => handleChange(e)}
                                options={area_name?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))}
                            />
                        </div>

                        <Grid container spacing={2} alignItems="flex-start" justifyContent="flex-start" className='p-4'>
                            <Grid item>
                                <CustomList
                                    items={left}
                                    // items={filteredLeft}
                                    searchValue={leftSearch}
                                    setSearchValue={setLeftSearch}
                                    handleToggle={handleToggle}
                                    checked={leftChecked}
                                    listType="left"
                                    placeholder="Search Available Point"
                                />

                            </Grid>
                            <Grid item>
                                <Grid container direction="column" alignItems="center" className='mt-40' >
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleCheckedRight}
                                        disabled={leftChecked.length === 0}
                                        aria-label="move selected right"
                                    >
                                        &gt;
                                    </Button>
                                    <div className='mb-2'></div>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleCheckedLeft}
                                        disabled={rightChecked.length === 0}
                                        aria-label="move selected left"
                                    >
                                        &lt;
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <CustomList
                                    items={right}
                                    // items={filteredRight}
                                    searchValue={rightSearch}
                                    setSearchValue={setRightSearch}
                                    handleToggle={handleToggle}
                                    checked={rightChecked}
                                    listType="right"
                                    placeholder="Search Group ID"
                                />
                            </Grid>
                        </Grid>

                        <div className="flex justify-end p-4">
                            <button onClick={handleClose} className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>

                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};

export default TransferListDialog;