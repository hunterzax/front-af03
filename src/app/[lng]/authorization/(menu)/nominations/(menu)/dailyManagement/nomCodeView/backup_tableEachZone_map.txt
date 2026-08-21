//   {

//                                 sortedData.length > 0 && sortedData?.map((row: any, index: any) => {
//                                     // paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {
//                                     return (
//                                         <tr
//                                             key={row?.id}
//                                             className={`${table_row_style}`}
//                                         >

//                                             {columnVisibility.supply_demand && (
//                                                 <td className="px-2 py-1 text-[#464255] ">{row?.data_temp2["1"] ? row?.data_temp2["1"] : ''}</td>
//                                             )}

//                                             {columnVisibility.concept_id && (
//                                                 // <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["3"] ? row?.data_temp2["3"] : ''}</td>
//                                                 <td className="px-2 py-1 text-[#464255]">
//                                                     {
//                                                         row?.data_temp2["3"]?.trim() !== "" ? row?.data_temp2["3"] :
//                                                             row?.data_temp2["4"]?.trim() !== "" ? row?.data_temp2["4"] :
//                                                                 row?.data_temp2["5"]?.trim() !== "" ? row?.data_temp2["5"] : ''
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility?.area && (
//                                                 <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} !justify-center items-center text-center flex`}>

//                                                     {(() => {
//                                                         const filter_area = areaMaster?.data?.find((item: any) => item.name === row?.area_text?.trim());

//                                                         return filter_area?.entry_exit_id == 2 ? (
//                                                             <div
//                                                                 className="flex justify-center items-center rounded-full p-1 text-[#464255]"
//                                                                 style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
//                                                             >
//                                                                 {`${filter_area?.name}`}
//                                                             </div>
//                                                         ) : filter_area?.entry_exit_id == 1 ? (
//                                                             <div
//                                                                 className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
//                                                                 style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
//                                                             >
//                                                                 {`${filter_area?.name}`}
//                                                             </div>
//                                                         )
//                                                             : null;
//                                                     })()}
//                                                 </td>
//                                             )}

//                                             {columnVisibility.nomination_point && (
//                                                 <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["3"] ? row?.data_temp2["3"] : ''}</td>
//                                             )}

//                                             {columnVisibility.unit && (
//                                                 <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["9"] ? row?.data_temp2["9"] : ''}</td>
//                                             )}

//                                             {columnVisibility.type && (
//                                                 <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["6"] ? row?.data_temp2["6"] : ''}</td>
//                                             )}

//                                             {columnVisibility.entry_exit && (
//                                                 <td className="px-2 py-1  justify-center ">
//                                                     {(() => {
//                                                         const filter_entry_exit = entryExitMaster?.data?.find((item: any) => item.name === row?.data_temp2["10"]?.trim());
//                                                         return filter_entry_exit ?
//                                                             <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: filter_entry_exit?.color }}>{`${filter_entry_exit?.name}`}</div>
//                                                             : ''
//                                                     })()}
//                                                 </td>
//                                             )}

//                                             {columnVisibility.wi && (
//                                                 // <td className={`px-2 py-1 text-[#464255] text-right ${row?.data_temp2["11"] < row?.newObj?.["11"]?.min || row?.data_temp2["11"] > row?.newObj?.["11"]?.max ? 'text-[#ED1B24] ' : ''}`}>
//                                                 <td
//                                                     className={`px-2 py-1 text-[#464255] text-right 
//                                                             ${row?.data_temp2?.["11"] !== undefined &&
//                                                             row?.newObj?.["11"]?.min !== undefined &&
//                                                             row?.newObj?.["11"]?.max !== undefined &&
//                                                             (row.data_temp2["11"] < row.newObj["11"].min || row.data_temp2["11"] > row.newObj["11"].max)
//                                                             ? 'text-[#ED1B24]'
//                                                             : ''
//                                                         }
//                                                     `}
//                                                 >

//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["11"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempData((prev: any) => {
//                                                                         const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
//                                                                         if (!updatedEntry) return prev; // If no match, return unchanged state
//                                                                         return prev.map((entry: any) =>
//                                                                             entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["11"]: value } } : entry
//                                                                         );
//                                                                     });
//                                                                     setIsEditedInRow(true)
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["11"] ? formatNumberThreeDecimal(row?.data_temp2["11"]) : ''
//                                                             row?.data_temp2?.["11"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["11"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["11"].toString().trim().replace(/,/g, ""))) : ""
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.hv && (
//                                                 <td
//                                                     // className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["12"]) < row?.newObj?.["12"]?.min || parseFloat(row?.data_temp2["12"]) > row?.newObj?.["12"]?.max ? 'text-[#ED1B24]' : ''}`}
//                                                     className={`px-2 py-1 text-[#464255] text-right ${row?.newObj?.["12"]?.min != null && row?.newObj?.["12"]?.max != null &&
//                                                         (parseFloat(row?.data_temp2?.["12"]) < row?.newObj?.["12"]?.min ||
//                                                             parseFloat(row?.data_temp2?.["12"]) > row?.newObj?.["12"]?.max)
//                                                         ? 'text-[#ED1B24]'
//                                                         : ''
//                                                         }`}
//                                                 >
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["12"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempData((prev: any) => {
//                                                                         const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
//                                                                         if (!updatedEntry) return prev; // If no match, return unchanged state
//                                                                         return prev.map((entry: any) =>
//                                                                             entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["12"]: value } } : entry
//                                                                         );
//                                                                     });
//                                                                     setIsEditedInRow(true)

//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["12"] ? formatNumberThreeDecimal(row?.data_temp2["12"]) : ''
//                                                             row?.data_temp2?.["12"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["12"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["12"].toString().trim().replace(/,/g, ""))) : ""
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.sg && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["13"]) > parseFloat(row?.newObj?.["13"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["13"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempData((prev: any) => {
//                                                                         const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
//                                                                         if (!updatedEntry) return prev; // If no match, return unchanged state
//                                                                         return prev.map((entry: any) =>
//                                                                             entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["13"]: value } } : entry
//                                                                         );
//                                                                     });
//                                                                     setIsEditedInRow(true)
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["13"] ? formatNumberThreeDecimal(row?.data_temp2["13"]) : ''
//                                                             row?.data_temp2?.["13"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["13"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["13"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h1 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["14"]) > parseFloat(row?.newObj?.["14"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["14"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '14');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["14"] ? formatNumberThreeDecimal(row?.data_temp2["14"]) : ''
//                                                             row?.data_temp2?.["14"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["14"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["14"].toString().trim().replace(/,/g, ""))) : ""
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h2 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["15"]) > parseFloat(row?.newObj?.["15"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["15"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '15');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["15"] ? formatNumberThreeDecimal(row?.data_temp2["15"]) : ''
//                                                             row?.data_temp2?.["15"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) : ""
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h3 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["16"]) > parseFloat(row?.newObj?.["16"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["16"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '16');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["16"] ? formatNumberThreeDecimal(row?.data_temp2["16"]) : ''
//                                                             row?.data_temp2?.["16"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h4 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["17"]) > parseFloat(row?.newObj?.["17"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["17"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '17');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["17"] ? formatNumberThreeDecimal(row?.data_temp2["17"]) : ''
//                                                             row?.data_temp2?.["17"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h5 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["18"]) > parseFloat(row?.newObj?.["18"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["18"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '18');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["18"] ? formatNumberThreeDecimal(row?.data_temp2["18"]) : ''
//                                                             row?.data_temp2?.["18"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) : ""
//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h6 && (tabIndex == 1 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["19"]) > parseFloat(row?.newObj?.["19"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["19"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '19');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["19"] ? formatNumberThreeDecimal(row?.data_temp2["19"]) : ''
//                                                             row?.data_temp2?.["19"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h7 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["20"]) > parseFloat(row?.newObj?.["20"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["20"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '20');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["20"] ? formatNumberThreeDecimal(row?.data_temp2["20"]) : ''
//                                                             row?.data_temp2?.["20"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h8 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["21"]) > parseFloat(row?.newObj?.["21"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["21"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '21');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["21"] ? formatNumberThreeDecimal(row?.data_temp2["21"]) : ''
//                                                             row?.data_temp2?.["21"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["21"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["21"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h9 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["22"]) > parseFloat(row?.newObj?.["22"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["22"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '22');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["22"] ? formatNumberThreeDecimal(row?.data_temp2["22"]) : ''
//                                                             row?.data_temp2?.["22"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["22"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["22"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h10 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["23"]) > parseFloat(row?.newObj?.["23"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["23"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '23');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["23"] ? formatNumberThreeDecimal(row?.data_temp2["23"]) : ''
//                                                             row?.data_temp2?.["23"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["23"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["23"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h11 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["24"]) > parseFloat(row?.newObj?.["24"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["24"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '24');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["24"] ? formatNumberThreeDecimal(row?.data_temp2["24"]) : ''
//                                                             row?.data_temp2?.["24"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["24"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["24"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h12 && (tabIndex == 2 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["25"]) > parseFloat(row?.newObj?.["25"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["25"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '25');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["25"] ? formatNumberThreeDecimal(row?.data_temp2["25"]) : ''
//                                                             row?.data_temp2?.["25"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["25"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["25"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h13 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["26"]) > parseFloat(row?.newObj?.["26"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["26"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '26');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["26"] ? formatNumberThreeDecimal(row?.data_temp2["26"]) : ''
//                                                             row?.data_temp2?.["26"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["26"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["26"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h14 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["27"]) > parseFloat(row?.newObj?.["27"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["27"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '27');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["27"] ? formatNumberThreeDecimal(row?.data_temp2["27"]) : ''
//                                                             row?.data_temp2?.["27"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["27"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["27"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h15 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["28"]) > parseFloat(row?.newObj?.["28"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["28"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '28');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["28"] ? formatNumberThreeDecimal(row?.data_temp2["28"]) : ''
//                                                             row?.data_temp2?.["28"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["28"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["28"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h16 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["29"]) > parseFloat(row?.newObj?.["29"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["29"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '29');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["29"] ? formatNumberThreeDecimal(row?.data_temp2["29"]) : ''
//                                                             row?.data_temp2?.["29"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["29"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["29"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h17 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["30"]) > parseFloat(row?.newObj?.["30"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["30"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '30');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["30"] ? formatNumberThreeDecimal(row?.data_temp2["30"]) : ''
//                                                             row?.data_temp2?.["30"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["30"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["30"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h18 && (tabIndex == 3 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["31"]) > parseFloat(row?.newObj?.["31"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["31"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '31');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["31"] ? formatNumberThreeDecimal(row?.data_temp2["31"]) : ''
//                                                             row?.data_temp2?.["31"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["31"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["31"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h19 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["32"]) > parseFloat(row?.newObj?.["32"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["32"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '32');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["32"] ? formatNumberThreeDecimal(row?.data_temp2["32"]) : ''
//                                                             row?.data_temp2?.["32"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["32"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["32"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h20 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["33"]) > parseFloat(row?.newObj?.["33"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["33"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '33');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["33"] ? formatNumberThreeDecimal(row?.data_temp2["33"]) : ''
//                                                             row?.data_temp2?.["33"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["33"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["33"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h21 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["34"]) > parseFloat(row?.newObj?.["34"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["34"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '34');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["34"] ? formatNumberThreeDecimal(row?.data_temp2["34"]) : ''
//                                                             row?.data_temp2?.["34"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["34"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["34"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h22 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["35"]) > parseFloat(row?.newObj?.["35"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["35"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '35');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["35"] ? formatNumberThreeDecimal(row?.data_temp2["35"]) : ''
//                                                             row?.data_temp2?.["35"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["35"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["35"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h23 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["36"]) > parseFloat(row?.newObj?.["36"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["36"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '36');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["36"] ? formatNumberThreeDecimal(row?.data_temp2["36"]) : ''
//                                                             row?.data_temp2?.["36"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["36"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["36"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.h24 && (tabIndex == 4 || tabIndex == 0) && (
//                                                 <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["37"]) > parseFloat(row?.newObj?.["37"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
//                                                     {
//                                                         isEditing && rowEditing == row?.old_index ?
//                                                             <NumericFormat
//                                                                 value={row?.data_temp2["37"] || ''}
//                                                                 onValueChange={(values) => {
//                                                                     const { value } = values;
//                                                                     setTempDataByTab(tabMain, row?.old_index, value, '37');
//                                                                 }}
//                                                                 thousandSeparator=","
//                                                                 decimalScale={3}
//                                                                 fixedDecimalScale={true}
//                                                                 allowNegative={false}
//                                                                 className={`${inputClass} `}
//                                                                 style={{ textAlign: "right", width: "100%" }}
//                                                             />
//                                                             :
//                                                             // row?.data_temp2["37"] ? formatNumberThreeDecimal(row?.data_temp2["37"]) : ''
//                                                             row?.data_temp2?.["37"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["37"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["37"].toString().trim().replace(/,/g, ""))) : ""

//                                                     }
//                                                 </td>
//                                             )}

//                                             {columnVisibility.total && (
//                                                 <td className="px-2 py-1 text-[#464255] text-right font-semibold">{row?.data_temp2["38"] ? formatNumberThreeDecimal(row?.data_temp2["38"]) : ''}</td>
//                                             )}

//                                             {columnVisibility.edit && (
//                                                 isEditing && rowEditing == row?.old_index ? (
//                                                     <td className="px-2 py-1 min-w-[140px]">
//                                                         <div className="flex gap-2 w-full">


//                                                             <button
//                                                                 onClick={() => {
//                                                                     handleSaveClick(row?.old_index);
//                                                                     setIsSaveClick(true);
//                                                                 }}
//                                                                 disabled={!isEditedInRow} // Disable if isEditedInRow is false
//                                                                 className={`flex w-[130px] h-[33px] px-4 py-2 rounded-[8px] items-center justify-center
//                                                                 ${isEditedInRow ? "bg-[#17AC6B] text-white cursor-pointer" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
//                                                             >
//                                                                 <div className="gap-2 flex">
//                                                                     {'Save Draft'}
//                                                                     <CheckOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />
//                                                                 </div>
//                                                             </button>


//                                                             <button
//                                                                 // onClick={handleEditClick}
//                                                                 // onClick={handleCancelClick}
//                                                                 onClick={() => handleCancelClick(row?.old_index)}
//                                                                 className={`flex w-[130px] h-[33px] bg-[#ffffff] border border-[#646464]  text-[#464255] px-4 py-2 rounded-[8px] items-center justify-center`}
//                                                             >
//                                                                 <div className="gap-2 flex">
//                                                                     {'Cancel'}
//                                                                     <CloseOutlinedIcon sx={{ fontSize: 18, color: '#464255' }} />
//                                                                 </div>
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 ) : (
//                                                     <td className="px-2 py-1 min-w-[140px]">
//                                                         <div className="relative inline-flex justify-center items-center w-full">
//                                                             {/* <ModeEditOutlinedIcon
//                                                                 onClick={() => handleEditClick(row?.old_index)}
//                                                                 className={`cursor-pointer border-[1px] rounded-[4px] `}
//                                                                 style={{
//                                                                     fontSize: "18px",
//                                                                     width: '22px',
//                                                                     height: '22px',
//                                                                     color: '#2B2A87',
//                                                                     borderColor: '#DFE4EA'
//                                                                 }}
//                                                             /> */}
//                                                             <ModeEditOutlinedIcon
//                                                                 onClick={(!isAfterGasDay && !readOnly) ? () => handleEditClick(row?.old_index) : undefined}
//                                                                 className={`border-[1px] rounded-[4px] ${(isAfterGasDay || readOnly) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
//                                                                 style={{
//                                                                     fontSize: "18px",
//                                                                     width: '22px',
//                                                                     height: '22px',
//                                                                     color: '#2B2A87',
//                                                                     borderColor: '#DFE4EA'
//                                                                 }}
//                                                             />
//                                                         </div>
//                                                     </td>
//                                                 )
//                                             )}
//                                         </tr>
//                                     )
//                                 })
//                             }
