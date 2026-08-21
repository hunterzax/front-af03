export const RenderEntries = ({ entries, handleSelect, disabledItems, isFallback = false }: any) => (
    entries?.map((item: any) => (
        <div key={item.id} className="flex items-center justify-center pr-2">
            <div
                className={`flex justify-center items-center cursor-pointer p-2 ${disabledItems?.includes(item.id) ? "bg-gray-500" : ""
                    }`}
                onClick={() => {
                    if (!disabledItems?.includes(item.id)) {
                        handleSelect(item.id, 'entry');
                    }
                }}
                style={{
                    backgroundColor: !disabledItems?.includes(item.id) ? item.color : 'gray',
                    width: '50px',
                    height: '50px',
                    borderRadius: '4px',
                }}
            >
                <span
                    className={!disabledItems?.includes(item.id) ? 'text-black' : 'text-white'}
                >
                    {item.name}
                </span>
            </div>
        </div>
    ))
);

export const RenderExit = ({ entries, handleSelect, disabledItems, isFallback = false }: any) => (
    entries?.map((item: any) => (
        <div className='flex items-center justify-center pr-2'>
            <div
                key={item.id}
                className={`flex justify-center items-center cursor-pointer p-2`}
                // onClick={() => handleSelect(item.id, 'exit')}
                onClick={() => {
                    if (!disabledItems.includes(item.id)) {
                        handleSelect(item.id, 'exit');
                    }
                }}
                style={{
                    // backgroundColor: selectedExits.includes(item.id) ? 'gray' : item.color,
                    backgroundColor: !disabledItems.includes(item.id) ? item.color : 'gray',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '1px solid transparent',
                }}
            >
                <span
                    // className={`${selectedExits.includes(item.id) ? 'text-white' : 'text-black'}`}
                    className={!disabledItems.includes(item.id) ? 'text-black' : 'text-white'}
                >
                    {item.name}
                </span>
            </div>
        </div>
    ))
);

