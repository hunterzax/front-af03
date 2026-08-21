import React, { useEffect } from 'react';

// interface PathItem {
//     area: {
//         color: string;
//         name: string;
//     };
//     revised_capacity_path_type_id: number;
// }

interface RevisedCapacityPathRenderProps {
    sortedRevisedCapacityPath: any[];
}

const RevisedCapacityPathRender: React.FC<RevisedCapacityPathRenderProps> = ({ sortedRevisedCapacityPath }) => {
    
    return (
        <div className="flex items-center gap-2">

            {sortedRevisedCapacityPath?.length > 0 ? (
                sortedRevisedCapacityPath.map((pathItem: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 pt-2 pb-2">
                        <div
                            className="flex justify-center items-center"
                            style={{
                                backgroundColor: pathItem.area.color,
                                width: '30px',
                                height: '30px',
                                borderRadius: pathItem.revised_capacity_path_type_id === 1 ? '4px' : '50%',
                            }}
                        >
                            <span
                                className={`${pathItem.revised_capacity_path_type_id === 1 ? 'text-white' : 'text-black'} text-[13px]`}
                            >
                                {pathItem.area.name}
                            </span>
                        </div>
                        {index < sortedRevisedCapacityPath.length - 1 && (
                            <span className="text-gray-500 -mr-2 -ml-2">{'→'}</span>
                        )}
                    </div>
                ))
            ) : (
                <div>Click to expand</div>
            )}
        </div>
    );
};

export default RevisedCapacityPathRender;