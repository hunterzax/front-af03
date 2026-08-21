// เอาไว้แปลงคีย์ตอน export ทั้งหลาย
import dayjs from "dayjs";
import { cutUploadFileName, fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatDateTimeSecNoPlusSeven, formatDateTimeSecPlusSeven, formatNumber, formatNumberFourDecimal, formatNumberFourDecimalNom, formatNumberSixDecimal, formatNumberSixDecimalNom, formatNumberThreeDecimal, formatNumberThreeDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, formatNumberTwoDecimalNomRound, formatStringToDDMMYYYY, roundNumber, sortRevisedCapacityPathByEdges, toDayjs } from "./generalFormatter";
import { parseToNumber } from "./number";

export const transformGroupTSO = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item.status ? "Active" : "Inactive";
                        break;
                    case 'name':
                        filteredItem[key] = item.name;
                        break;
                    case 'division_name':
                        filteredItem[key] = item.division?.map((d: any) => d.division_name).join(", ") || null;
                        break;
                    case 'role_default':
                        filteredItem[key] = item.role_default?.[0]?.role?.name || null;
                        break;
                    case 'telephone':
                        filteredItem[key] = item.telephone ? item.telephone : '';
                        break;
                    case 'email':
                        filteredItem[key] = item.email;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = item.update_by_account
                            ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
                            : null;
                        break;
                }
            }
        });

        return filteredItem;
    });
};

export const transformGroupShippers = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item.status ? "Active" : "Inactive";
                        break;
                    case 'name':
                        filteredItem[key] = item.name;
                        break;
                    case 'company_name':
                        filteredItem[key] = item.company_name;
                        break;
                    case 'division_name':
                        filteredItem[key] = item.division?.map((d: any) => d.division_name).join(", ") || null;
                        break;
                    case 'role_default':
                        filteredItem[key] = item.role_default?.[0]?.role?.name || null;
                        break;
                    case 'address':
                        filteredItem[key] = item.address;
                        break;
                    case 'telephone':
                        filteredItem[key] = item.telephone;
                        break;
                    case 'email':
                        filteredItem[key] = item.email;
                        break;
                    case 'bank_no': // จงใจใช้ key ไม่ตรง เพราะหน้า history ส่งมายังงี้
                        filteredItem[key] = item.bank_no;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = item.update_by_account
                            ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
                            : null;
                        break;
                }
            }
        });
        return filteredItem;
    });
};

export const transformGroupOthers = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item.status ? "Active" : "Inactive";
                        break;
                    case 'group_name':
                        filteredItem[key] = item.name;
                        break;
                    case 'division_name':
                        filteredItem[key] = item.division?.map((d: any) => d.division_name).join(", ") || null;
                        break;
                    case 'default_role':
                        filteredItem[key] = item.role_default?.[0]?.role?.name || null;
                        break;
                    case 'telephone':
                        filteredItem[key] = item.telephone;
                        break;
                    case 'email':
                        filteredItem[key] = item.email;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = item.update_by_account
                            ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
                            : null;
                        break;
                }
            }
        });

        return filteredItem;
    });
};

export const transformLoginTracking = (dataMain: any, column?: any) => {
    const getLastLoginDuration = (row: any) => {
        let text = ''
        if (row?.login_logs?.length > 0) {
            const lastLogin = toDayjs(row?.login_logs[0]?.create_date)
            const now = toDayjs()
            let duration = now.diff(lastLogin, 'month')
            if (duration > 0) {
                if (duration >= 12) {
                    duration = now.diff(lastLogin, 'year')
                    text = `${duration} ${duration == 1 ? 'year' : 'years'}`
                }
                else {
                    text = `${duration} ${duration == 1 ? 'month' : 'months'}`
                }
            }
            else {
                duration = now.diff(lastLogin, 'day')
                text = `${duration} ${duration == 1 ? 'day' : 'days'}`
            }
        }
        return text
    }
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'login_mode':
                        filteredItem[key] = item?.login_mode ? item?.login_mode?.name : null;
                        break;
                    case 'user_id':
                        filteredItem[key] = item?.user_id;
                        break;
                    case 'first_name':
                        filteredItem[key] = item?.first_name
                        break;
                    case 'last_name':
                        filteredItem[key] = item?.last_name
                        break;
                    case 'type':
                        filteredItem[key] = item?.type_account ? item?.type_account?.name : null;
                        break;
                    case 'company_name':
                        filteredItem[key] = item?.company_name;
                        break;
                    case 'last_login':
                        filteredItem[key] = item?.login_logs?.length > 0 ? formatDate(item?.login_logs[0]?.create_date) : null;
                        break;
                    case 'last_login_duration':
                        const duration = getLastLoginDuration(item)
                        filteredItem[key] = duration;
                        break;
                }
            }
        });

        return filteredItem;
    });
};

export const transformArea = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit ? item?.entry_exit?.name : "";
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone ? item?.zone?.name : '';
                        break;
                    case 'name':
                        filteredItem[key] = item?.name ? item?.name : '';
                        break;
                    case 'desc':
                        filteredItem[key] = item?.description ? item?.description : '';
                        break;
                    case 'area_nom_cap':
                        filteredItem[key] = item?.area_nominal_capacity !== null && item?.area_nominal_capacity !== undefined ? formatNumberThreeDecimal(item?.area_nominal_capacity) : '';
                        break;
                    case 'supply_ref_quality':
                        // filteredItem[key] = item?.supply_reference_quality_area !== null && item?.supply_reference_quality_area !== undefined ? formatNumberThreeDecimal(item?.supply_reference_quality_area) : '';
                        filteredItem[key] = item?.supply_reference_quality_area_by?.name !== null && item?.supply_reference_quality_area_by?.name !== undefined ? item?.supply_reference_quality_area_by?.name : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item?.start_date) : '';
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item?.end_date) : '';
                        break;
                    case 'updated_by':
                        filteredItem[key] = item.update_by_account
                            ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
                            : null;
                        break;
                }
            }
        });

        return filteredItem;
    });
};

export const transformContractPoint = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit ? item?.entry_exit?.name : "";
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone ? item?.zone?.name : '';
                        break;
                    case 'area':
                        filteredItem[key] = item?.area ? item?.area?.name : '';
                        break;
                    case 'contract_point':
                        filteredItem[key] = item?.contract_point ? item?.contract_point : '';
                        break;
                    case 'desc':
                        filteredItem[key] = item?.description ? item?.description : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.contract_point_start_date ? formatDateNoTime(item?.contract_point_start_date) : '';
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.contract_point_end_date ? formatDateNoTime(item?.contract_point_end_date) : '';
                        break;
                    case 'updated_by':
                        filteredItem[key] = item?.update_by_account
                            ? `${item.update_by_account.first_name} ${item.update_by_account.last_name} ${formatDateTimeSec(item?.update_date) || ''}`
                            : null;
                        break;
                }
            }
        });

        return filteredItem;
    });
};

export const transformKeys = (data: any) => {
    return data.map((item: any) => {
        const transformedItem: any = {};
        Object.keys(item).forEach((key) => {
            // Capitalize the first letter and replace underscores with spaces
            if (key === "supply_demand") {
                transformedItem["Supply/Demand"] = item[key];
            } else if (key === "entry_exit") {
                transformedItem["Entry/Exit"] = item[key];
            } else if (key === "wi") {
                transformedItem["WI"] = item[key];
            } else if (key === "hv") {
                transformedItem["HV"] = item[key];
            } else if (key === "sg") {
                transformedItem["SG"] = item[key];
            } else {
                const newKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
                transformedItem[newKey] = item[key];
            }
        });
        return transformedItem;
    });
};

export const transformChartArea = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => ({
        // status: item.status ? "Active" : "Inactive",
        area: item.description,
        group: item.group?.name || null,
        term_type: item.term_type?.name || null,
        date: item.value?.map((d: any) => d.date).join(", ") || null,
        value: item.value?.map((d: any) => d.value).join(", ") || null,
        // role_default_name: item.role_default?.[0]?.role?.name || null,
        // telephone: item.telephone,
        // start_date: item.start_date,
        // end_date: item.end_date,
        // updated_by: item.update_by_account
        //     ? `${item.update_by_account.first_name} ${item.update_by_account.last_name}`
        //     : null,
    }));
}

export const transformPathConfig = (dataMain: any, column?: any) => {

    let res = sortRevisedCapacityPathByEdges(dataMain)

    return res.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'default_capacity_path':
                        filteredItem[key] = (item?.paths?.revised_capacity_path?.map((obj: any) => {
                            return obj?.area?.name
                            // return obj?.paths?.revised_capacity_path?.map((path: any) => {
                            //     return path?.area.name || ''
                            // })
                        }).join() || []).replaceAll(',', ' => ')
                        break;
                    case 'exit':
                        filteredItem[key] = item?.exit_name_temp || null;
                        break;
                    case 'activate_date':
                        filteredItem[key] = item && item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'update_by':
                        filteredItem[key] = item ? `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` : null;
                        break;
                }
            }
        });

        return filteredItem;
    });
}

export const transformPlanningFileSubmissionTemplate = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'shipper_name':
                        filteredItem[key] = item?.group?.name || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        // filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${formatDate(item?.update_date) || ''}` || null;
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${formatDateTimeSec(item?.update_date) || ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformPlanningDeadLine = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    // case 'type':
                    //     filteredItem[key] = item?.term_type?.name || null;
                    //     break;
                    // case 'hour':
                    //     filteredItem[key] = item?.hour + ":" + item?.minute || null;
                    //     break;
                    // case 'day':
                    //     filteredItem[key] = item?.day || null;
                    //     break;
                    case 'term':
                        filteredItem[key] = item?.term_type?.name || null;
                        break;
                    case 'end_time':
                        filteredItem[key] = item?.hour + ":" + item?.minute || null;
                        break;
                    case 'date_of_month':
                        filteredItem[key] = item?.day || null;
                        break;
                    case 'before_month':
                        filteredItem[key] = item?.before_month || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformNominationPoint = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit?.name || null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone?.name || null;
                        break;
                    case 'area':
                        filteredItem[key] = item?.area?.name || null;
                        break;
                    case 'contract_point':
                        // filteredItem[key] = item?.contract_point?.contract_point || null;
                        filteredItem[key] = item.contract_point_list?.map((d: any) => d.contract_point).join(",    ") || null;
                        break;
                    case 'nomination_point':
                        filteredItem[key] = item?.nomination_point || null;
                        break;
                    case 'description':
                        filteredItem[key] = item?.description || null;
                        break;
                    case 'customer_type':
                        filteredItem[key] = item?.customer_type?.name || null;
                        break;
                    case 'maximum_capacity':
                        filteredItem[key] = formatNumberThreeDecimal(item?.maximum_capacity) || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });

        return filteredItem;
    });
}

export const transformNominationDeadline = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'user_type':
                        filteredItem[key] = item?.user_type?.name || null;
                        break;
                    case 'process_type':
                        filteredItem[key] = item?.process_type?.name || null;
                        break;
                    case 'nom_type':
                        filteredItem[key] = item?.nomination_type?.document_type || null;
                        break;
                    case 'time':
                        filteredItem[key] = String(item?.hour).padStart(2, '0') + `:` + String(item?.minute).padStart(2, '0');
                        break;
                    case 'before_gas':
                        filteredItem[key] = item?.before_gas_day || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformEventOffspecGas = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'action_date':
                        filteredItem[key] = item?.create_date ? formatDate(item?.create_date) : '';
                        break;
                    case 'edited_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformEventEmergencyDiffDay = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'version':
                        filteredItem[key] = item?.version_text ? item?.version_text : '';
                        break;
                    case 'action_date':
                        filteredItem[key] = item?.create_date ? formatDate(item?.create_date) : '';
                        break;
                    case 'edited_by':
                        // filteredItem[key] = `${item?.row?.create_by_account?.first_name || ''} ${item?.row?.create_by_account?.last_name || ''} ` || null;

                        // {row?.row?.create_by_account?.first_name} {row?.row?.create_by_account?.last_name}

                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformEventOfIf = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'version':
                        filteredItem[key] = item?.version_text ? item?.version_text : '';
                        break;
                    case 'action_date':
                        filteredItem[key] = item?.create_date ? formatDate(item?.create_date) : '';
                        break;
                    case 'edited_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformConceptPoint = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'concept_points':
                        filteredItem[key] = item?.concept_point || null;
                        break;
                    case 'type_concept_points':
                        filteredItem[key] = item?.type_concept_point?.name || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformConceptPointLimit = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group?.name : '';
                        break;
                    case 'concept_point':
                        filteredItem[key] = item?.concept_point ? item?.concept_point?.concept_point : '';
                        break;
                    case 'created_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformMeteringCheckingCondition = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'version':
                        filteredItem[key] = item?.version ? item?.version : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformNonTpaPoint = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'area':
                        filteredItem[key] = item?.area?.name || null;
                        break;
                    case 'nomination_point':
                        filteredItem[key] = item?.nomination_point?.nomination_point || null;
                        break;
                    case 'non_tpa_point_name':
                        filteredItem[key] = item?.non_tpa_point_name || null;
                        break;
                    case 'description':
                        filteredItem[key] = item?.description || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformMeteringPoint = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'metered_id':
                        filteredItem[key] = item?.metered_id || null;
                        break;
                    case 'metered_point_name':
                        filteredItem[key] = item?.metered_point_name || null;
                        break;
                    case 'description':
                        filteredItem[key] = item?.description || null;
                        break;
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit?.name || null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone?.name || null;
                        break;
                    case 'area':
                        filteredItem[key] = item?.area?.name || null;
                        break;
                    case 'customer_type':
                        filteredItem[key] = item?.customer_type?.name || null;
                        break;
                    case 'nomination_point_non_tpa_point':
                        if (item?.point_type_id == 1) {
                            filteredItem[key] = item?.nomination_point?.nomination_point || null;
                        } else {
                            filteredItem[key] = item?.non_tpa_point?.non_tpa_point_name || null;
                        }
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformUserGuide = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'document_name':
                        filteredItem[key] = item?.document_name || null;
                        break;
                    case 'file':
                        filteredItem[key] = cutUploadFileName(item?.file) || null;
                        break;
                    case 'desc':
                        filteredItem[key] = item?.description || null;
                        break;
                    case 'download':
                        filteredItem[key] = item?.file || null;
                        break;
                    case 'nom_point':
                        filteredItem[key] = item?.nomination_point || null;
                        break;
                    case 'create_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` || null;
                        break;
                    case 'update_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformSystemParameter = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'module':
                        filteredItem[key] = item?.menus ? item?.menus?.name : '';
                        break;
                    case 'system_parameter':
                        filteredItem[key] = item?.system_parameter ? item?.system_parameter?.name : '';
                        break;
                    case 'value':
                        filteredItem[key] = formatNumberThreeDecimal(item?.value) || '';
                        break;
                    case 'link':
                        filteredItem[key] = item?.link ? item?.link : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformHvOperationFlow = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'type':
                        filteredItem[key] = item?.hv_type ? item?.hv_type?.type : '';
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group?.name : '';
                        break;
                    case 'meter_point':
                        filteredItem[key] = item?.metering_point ? item?.metering_point?.metered_point_name : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'created_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDateTimeSec(item?.create_date) : ''}` || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformIntradayAccImbalInvenAdjust = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {

        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'east':
                        filteredItem[key] = item?.east !== null && item?.east !== undefined ? formatNumberFourDecimal(item?.east) : null;
                        break;
                    case 'west':
                        filteredItem[key] = item?.west !== null && item?.west !== undefined ? formatNumberFourDecimal(item?.west) : null;
                        break;
                    case 'comment':
                        filteredItem[key] = item.comment?.map((d: any) => d.remark).join(", ") || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformBalanceAdjustDailyImbalance = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group?.name : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone_obj ? item?.zone_obj?.name : null;
                        break;
                    case 'adjust_imbalance':
                        filteredItem[key] = item?.adjust_imbalance !== null && item?.adjust_imbalance !== undefined ? formatNumberFourDecimal(item?.adjust_imbalance) : null;
                        break;
                    case 'daily_imbalance':
                        filteredItem[key] = item?.dailyAccIm !== null && item?.dailyAccIm !== undefined ? formatNumberFourDecimal(item?.dailyAccIm) : null;
                        break;
                    case 'daily_final_imbalance':
                        filteredItem[key] = item?.finalDailyAccIm !== null && item?.finalDailyAccIm !== undefined ? formatNumberFourDecimal(item?.finalDailyAccIm) : null;
                        break;

                    case 'intraday_imbalance':
                        filteredItem[key] = item?.intradayAccIm !== null && item?.intradayAccIm !== undefined ? formatNumberFourDecimal(item?.intradayAccIm) : null;
                        break;
                    case 'intraday_final_imbalance':
                        filteredItem[key] = item?.finalIntradayAccIm !== null && item?.finalIntradayAccIm !== undefined ? formatNumberFourDecimal(item?.finalIntradayAccIm) : null;
                        break;

                    case 'comment':
                        filteredItem[key] = item.comment?.map((d: any) => d.remark).join(", ") || null;
                        break;

                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSecPlusSeven(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformAllocationReport = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit_obj ? item?.entry_exit_obj?.name : null;
                        break;
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'timestamp':
                        filteredItem[key] = item?.execute_timestamp ? dayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null;
                        break;
                    case 'nomination_point_concept_point':
                        filteredItem[key] = item?.point ? item?.point : null;
                        break;
                    // View : Export เอา Column Capacity Right ออก https://app.clickup.com/t/86eub6dbn
                    // case 'capacity_right':
                    //     filteredItem[key] = item?.contractCapacity ? formatNumberFourDecimal(item?.contractCapacity) : null;
                    //     break;
                    case 'nominated_value':
                        filteredItem[key] = item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : null;
                        break;
                    case 'system_allocation':
                        filteredItem[key] = item?.allocatedValue !== null && item?.allocatedValue !== undefined ? formatNumberFourDecimal(item?.allocatedValue) : null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformShipperNomReport = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                // สวัสดีครับผมคมพัควัตโต
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? item?.gas_day : null;
                        break;
                    case 'area':
                        filteredItem[key] = item?.areaObj ? item?.areaObj?.name : null;
                        break;

                    // case 'capacity_right':
                    //     filteredItem[key] = item?.capacityRightMMBTUD ? formatNumberFourDecimal(item?.capacityRightMMBTUD) : '0.0000';
                    //     break;
                    // case 'nominated_value':
                    //     filteredItem[key] = item?.nominatedValueMMBTUD ? formatNumberFourDecimal(item?.nominatedValueMMBTUD) : '0.0000';
                    //     break;
                    // case 'overusage':
                    //     filteredItem[key] = item?.overusageMMBTUD ? formatNumberFourDecimal(item?.overusageMMBTUD) : '0.0000';
                    //     break;

                    case 'capacity_right':
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.capacityRightMMBTUD)
                            :
                            item?.capacityRightMMBTUD ? formatNumberFourDecimal(item?.capacityRightMMBTUD) : '0.0000';
                        break;
                    case 'nominated_value':
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.nominatedValueMMBTUD)
                            :
                            item?.nominatedValueMMBTUD ? formatNumberFourDecimal(item?.nominatedValueMMBTUD) : '0.0000';
                        break;
                    case 'overusage':
                        // filteredItem[key] = item?.ovrusageMMBTUD ? formatNumberFourDecimal(item?.overusageMMBTUD) : '0.0000';
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.overusageMMBTUD)
                            :
                            item?.overusageMMBTUD ? formatNumberFourDecimal(item?.overusageMMBTUD) : '0.0000';
                        break;
                }
            }
        });

        // Daily > View > Export หัว Column ยังไม่มีหน่วย https://app.clickup.com/t/86ettypm2
        const keysToRename = ["capacity_right", "nominated_value", "overusage"];
        const updatedItem = Object.entries(filteredItem).reduce((acc: any, [key, value]): any => {
            if (keysToRename.includes(key)) {
                acc[`${key}_mmbtud`] = value;
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);

        return updatedItem;
    });
}


export const transformTariffCrDrNoteView = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'contract_code':
                    filteredItem[key] = item?.contract_code ? item?.contract_code : null;
                    break;
                case 'contract_type':
                    filteredItem[key] = item?.term_obj ? item?.term_obj?.name : null;
                    break;
                case 'quantity':
                    filteredItem[key] = item?.quantity ? formatNumber(item?.quantity) : '';
                    break;
                case 'unit':
                    filteredItem[key] = item?.unit ? item?.unit : '';
                    break;
                case 'fee_baht':
                    filteredItem[key] = item?.fee !== null && item?.fee !== undefined ? formatNumberTwoDecimalNom(item?.fee) : '';
                    break;
                case 'amount_baht':
                    filteredItem[key] = item?.amount !== null && item?.amount !== undefined ? formatNumberTwoDecimalNom(item?.amount) : '';
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformTariffCrDrNoteHistory = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'cndn_id':
                    filteredItem[key] = item?.cndn_id ? item?.cndn_id : null;
                    break;
                case 'tariff_id':
                    filteredItem[key] = item?.tariff_id ? item?.tariff_id : null;
                    break;
                case 'comment':
                    filteredItem[key] = item.tariff_credit_debit_note_comment?.map((d: any) => d.comment).join(", ") || null;
                    break;
                case 'updated_by':
                    // filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` || null;
                    filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformMeteringManagement = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'gas_day':
                    filteredItem[key] = item?.gasDay ? formatStringToDDMMYYYY(item?.gasDay) : null;
                    break;
                case 'mtr_p_id':
                    filteredItem[key] = item?.meteringPointId ? item?.meteringPointId : null;
                    break;
                case 'zone':
                    filteredItem[key] = item?.prop ? item?.prop?.zone?.name : null;
                    break;
                case 'area':
                    filteredItem[key] = item?.prop ? item?.prop?.area?.name : null;
                    break;
                case 'customer_type':
                    filteredItem[key] = item?.prop ? item?.prop?.customer_type?.name : null;
                    break;
                case 'volume':
                    filteredItem[key] = item?.volume ? formatNumberSixDecimal(item?.volume) : null;
                    break;
                case 'heating_volume':
                    filteredItem[key] = item?.heatingValue ? formatNumberThreeDecimal(item?.heatingValue) : null;
                    break;
                case 'energy':
                    filteredItem[key] = item?.energy ? formatNumberThreeDecimal(item?.energy) : null;
                    break;
                case 'received_timestamp':
                    filteredItem[key] = item?.registerTimestamp ? dayjs(item.registerTimestamp).format('DD/MM/YYYY HH:mm:ss') : null;
                    break;
                case 'insert_timestamp':
                    filteredItem[key] = item?.insert_timestamp ? dayjs(item?.insert_timestamp, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Bangkok').format("DD/MM/YYYY HH:mm:ss") : null;
                    break;
                case 'mtr_r_id':
                    filteredItem[key] = item?.metering_retrieving_id ? item?.metering_retrieving_id : null;
                    break;
                case 'source':
                    filteredItem[key] = item?.datasource ? item?.datasource : null;
                    break;
            }
        });
        return filteredItem;
    });
}


export const transformReserveBalGasContractView = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'zone':
                    filteredItem[key] = item?.zone ? item?.zone?.name : null;
                    break;
                case 'area':
                    filteredItem[key] = item?.area ? item?.area?.name : null;
                    break;
                case 'entry_exit':
                    filteredItem[key] = item?.entry_exit ? item?.entry_exit?.name : null;
                    break;
                case 'nomination_point':
                    filteredItem[key] = item?.nom_point ? item?.nom_point?.nomination_point : null;
                    break;
                case 'start_date':
                    filteredItem[key] = item?.start_date ? dayjs(item?.start_date).format('DD/MM/YYYY') : null;
                    break;
                case 'end_date':
                    filteredItem[key] = item?.end_date ? dayjs(item?.end_date).format('DD/MM/YYYY') : null;
                    break;
                case 'daily_reserve_cap':
                    filteredItem[key] = item?.daily_reverse_cap ? formatNumberThreeDecimal(item?.daily_reverse_cap) : null;
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformShipperNomReportTabZero = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'gas_day':
                    filteredItem[key] = item?.gas_day_text ? item?.gas_day_text : null;
                    break;
                case 'shipper_name':
                    filteredItem[key] = item?.shipper_name ? item?.shipper_name : null;
                    break;
                case 'capacity_right':
                    // filteredItem[key] = item?.capacityRightMMBTUD !== null && item?.capacityRightMMBTUD !== undefined ? formatNumberFourDecimal(item?.capacityRightMMBTUD) : null;
                    // filteredItem[key] = item?.tmpSumCapacityRightMMBTUD !== null && item?.tmpSumCapacityRightMMBTUD !== undefined ? formatNumberFourDecimal(item?.tmpSumCapacityRightMMBTUD) : null;
                    filteredItem[key] = item?.tmpSumCapacityRightMMBTUD !== null && item?.tmpSumCapacityRightMMBTUD !== undefined ? formatNumberThreeDecimal(item?.tmpSumCapacityRightMMBTUD) : null;
                    break;
                case 'nominated_value':
                    // filteredItem[key] = item?.cndn_id ? item?.cndn_id : null;
                    filteredItem[key] = item?.nominatedValueMMBTUD !== null && item?.nominatedValueMMBTUD !== undefined ? formatNumberThreeDecimal(item?.nominatedValueMMBTUD) : null;
                    break;
                case 'overusage':
                    // filteredItem[key] = item?.overusageMMBTUD !== null && item?.overusageMMBTUD !== undefined ? formatNumberFourDecimal(item?.overusageMMBTUD) : null;
                    filteredItem[key] = item?.tmpOverUseage !== null && item?.tmpOverUseage !== undefined ? formatNumberThreeDecimal(item?.tmpOverUseage) : null;
                    break;
                case 'imbalance':
                    filteredItem[key] = item?.imbalanceMMBTUD !== null && item?.imbalanceMMBTUD !== undefined ? formatNumberThreeDecimal(item?.imbalanceMMBTUD) : null;
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformShipperNomReportTabWeekly = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};

        const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const capaRight = extra_obj?.subTabIndex < 7 ? item?.weeklyDay?.[dayKeys[extra_obj?.subTabIndex]]?.capacityRightMMBTUD : item?.capacityRightMMBTUD;
        const nomVal = extra_obj?.subTabIndex < 7 ? item?.weeklyDay?.[dayKeys[extra_obj?.subTabIndex]]?.nominatedValueMMBTUD : item?.nominatedValueMMBTUD;
        let calSodOveruse = capaRight - nomVal

        const overUse = calSodOveruse > 0 ? 0 : Math.abs(calSodOveruse)
        const imbal = extra_obj?.subTabIndex < 7 ? item?.weeklyDay?.[dayKeys[extra_obj?.subTabIndex]]?.imbalanceMMBTUD : item?.imbalanceMMBTUD;

        Object.keys(column).forEach(key => {
            switch (key) {
                case 'gas_day':
                    filteredItem[key] = item?.gas_day_text ? item?.gas_day_text : null;
                    break;
                case 'shipper_name':
                    filteredItem[key] = item?.shipper_name ? item?.shipper_name : null;
                    break;
                case 'capacity_right':
                    filteredItem[key] = formatNumberThreeDecimal(capaRight);
                    break;
                case 'nominated_value':
                    filteredItem[key] = formatNumberThreeDecimal(nomVal);
                    break;
                case 'overusage':
                    filteredItem[key] = formatNumberThreeDecimal(overUse);
                    break;
                case 'imbalance':
                    filteredItem[key] = formatNumberThreeDecimal(imbal);
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformTariffDetailPage = (dataMain: any, column?: any, extra_obj?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            switch (key) {
                case 'type_charge':
                    filteredItem[key] = item?.tariff_type_charge ? item?.tariff_type_charge?.name : null;
                    break;
                case 'contract_code':
                    filteredItem[key] = item?.contract_code ? item?.contract_code?.contract_code : null;
                    break;
                case 'contract_type':
                    filteredItem[key] = item?.term_type ? item?.term_type?.name : null;
                    break;
                case 'quantity_operator':
                    filteredItem[key] = item?.quantity_operator !== null && item?.quantity_operator !== undefined ? formatNumberTwoDecimalNom(item?.quantity_operator) : null;
                    break;
                case 'quantity':
                    // filteredItem[key] = item?.quantity !== null && item?.quantity_operator !== undefined ? formatNumberThreeDecimal(item?.quantity) : null;
                    filteredItem[key] = item?.quantity !== null && item?.quantity_operator !== undefined ? roundNumber(item?.quantity) : null;
                    break;
                case 'unit':
                    filteredItem[key] = item?.unit ? item?.unit : null;
                    break;
                // case 'co_efficient':
                //     filteredItem[key] = item?.co_efficient !== null && item?.co_efficient !== undefined ? formatNumberThreeDecimal(item?.co_efficient) : null;
                //     break;
                case 'fee':
                    // filteredItem[key] = item?.fee !== null && item?.fee !== undefined ? formatNumberTwoDecimalNom(item?.fee) : null;
                    filteredItem[key] = item?.fee !== null && item?.fee !== undefined ? formatNumberFourDecimalNom(item?.fee) : null;
                    break;
                case 'amount_baht':
                    // filteredItem[key] = item?.amount !== null && item?.amount !== undefined ? formatNumberTwoDecimalNom(item?.amount) : null;
                    filteredItem[key] = item?.amount !== null && item?.amount !== undefined ? formatNumberTwoDecimalNomRound(item?.amount) : null; // Column Amount (Baht) คำนวณไม่ถูก มันต้องเอาค่าจำนวนเต็มของ Quantity ที่แสดงตรงหน้า UI มา x กับ ค่า Fee แล้วถ้าทศนิยมมันเกิน 2 ตำแหน่ง จะต้องปัดให้เหลือ 2 ตำแหน่ง (ปัดขึ้นปัดลงตามปกติ) https://app.clickup.com/t/86evh20ju
                    break;
                case 'amount_operator_baht':
                    filteredItem[key] = item?.amount_operator !== null && item?.amount_operator !== undefined ? formatNumberTwoDecimalNom(item?.amount_operator) : null;
                    break;
                case 'amount_compare_baht':
                    filteredItem[key] = item?.amount_compare !== null && item?.amount_compare !== undefined ? formatNumberTwoDecimalNom(item?.amount_compare) : null;
                    break;
                case 'difference':
                    filteredItem[key] = item?.difference !== null && item?.difference !== undefined ? formatNumberThreeDecimal(item?.difference) : null;
                    break;
            }
        });
        return filteredItem;
    });
}

export const transformTariffDetailPageKeys = (data: any) => {
    return data.map((item: any) => {
        const transformedItem: any = {};
        Object.keys(item).forEach((key) => {
            // Capitalize the first letter and replace underscores with spaces
            let newKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
            switch (newKey.trim()) {
                case 'Co Efficient':
                    newKey += ' (%)';
                    break;
                case 'Fee':
                    newKey += ' (Baht/MMBTU)';
                    break;
                case 'Amount Baht':
                case 'Amount Operator Baht':
                case 'Amount Compare Baht':
                    newKey = newKey.replace('Baht', '(Baht)');
                    break;
            }
            transformedItem[newKey] = item[key];
        });
        return transformedItem;
    });
};

export const transformShipperNomReportView = (dataMain: any, column?: any, extra_obj?: any) => {
    return dataMain?.map((item: any) => {
        console.log('item : ', item);
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = extra_obj?.tabIndex == 2 ? item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.gas_day_text : (item?.gas_day_text || item?.gas_day);
                        break;
                    case 'area':
                        filteredItem[key] = item?.areaObj ? item?.areaObj?.name : null;
                        break;
                    case 'capacity_right':
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.capacityRightMMBTUD)
                            :
                            item?.capacityRightMMBTUD ? formatNumberFourDecimal(item?.capacityRightMMBTUD) : '0.0000';
                        break;
                    case 'nominated_value':
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.nominatedValueMMBTUD)
                            :
                            item?.nominatedValueMMBTUD ? formatNumberFourDecimal(item?.nominatedValueMMBTUD) : (item?.nominatedValueMMBTUD ===  null ? "" : '0.0000');
                        break;
                    case 'overusage':
                        // filteredItem[key] = item?.ovrusageMMBTUD ? formatNumberFourDecimal(item?.overusageMMBTUD) : '0.0000';
                        filteredItem[key] = extra_obj?.tabIndex == 2 ?
                            formatNumberFourDecimal(item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.overusageMMBTUD)
                            :
                            item?.overusageMMBTUD ? formatNumberFourDecimal(item?.overusageMMBTUD) : (item?.nominatedValueMMBTUD ===  null ? "" : '0.0000');
                        break;
                }
            }
        });

        // Daily > View > Export หัว Column ยังไม่มีหน่วย https://app.clickup.com/t/86ettypm2
        const keysToRename = ["capacity_right", "nominated_value", "overusage"];
        const updatedItem = Object.entries(filteredItem).reduce((acc: any, [key, value]): any => {
            if (keysToRename.includes(key)) {
                acc[`${key}_mmbtud`] = value;
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);

        return updatedItem;
    });
}


export const transformAllocationShipperReportDownload = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day_from':
                        filteredItem[key] = item?.gas_day_from ? dayjs(item?.gas_day_from).format("DD/MM/YYYY") : null;
                        break;
                    case 'gas_day_to':
                        filteredItem[key] = item?.gas_day_to ? dayjs(item?.gas_day_to).format("DD/MM/YYYY") : null;
                        break;
                    case 'file':
                        filteredItem[key] = item?.file ? item?.file : null;
                        break;
                    case 'approved_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformVentCommissioningOtherGas = (dataMain: any, column?: any) => {
    const normalized = fillMissingUpdateByAccount(dataMain);

    return normalized?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group?.name : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone ? item?.zone?.name : null;
                        break;
                    case 'vent_gas':
                        filteredItem[key] = item?.vent_gas_value_mmbtud !== null && item?.vent_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(item?.vent_gas_value_mmbtud) : null;
                        break;
                    case 'commissioning_gas':
                        filteredItem[key] = item?.commissioning_gas_value_mmbtud !== null && item?.commissioning_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(item?.commissioning_gas_value_mmbtud) : null;
                        break;
                    case 'other_gas':
                        filteredItem[key] = item?.other_gas_value_mmbtud !== null && item?.other_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(item?.other_gas_value_mmbtud) : null;
                        break;
                    case 'comment':
                        filteredItem[key] = item.vent_commissioning_other_gas_remark?.map((d: any) => d.remark).join(", ") || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        // filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDateTimeSec(item?.create_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformMinimumTabDaily = (dataMain: any, column?: any) => {
    
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? item?.gas_day : null;
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group : null;
                        break;
                    case 'contract_code':
                        filteredItem[key] = item?.contract_code ? item?.contract_code : item?.reserve_balancing_gas_contract ? item?.reserve_balancing_gas_contract : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zoneObj ? item?.zoneObj?.name : null;
                        break;
                    case 'change_min_inventory':
                        // filteredItem[key] = item?.minInven ?? (item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ? formatNumberThreeDecimal(item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value) : null);
                        filteredItem[key] = (item?.minInvenChange || item?.minInven) !== null && (item?.minInvenChange || item?.minInven) !== undefined && (item?.minInvenChange || item?.minInven) !== '' ? formatNumberThreeDecimal((item?.minInvenChange || item?.minInven)) : null;
                        break;
                    case 'exchange_min_invent':
                        // filteredItem[key] = item?.exchange ?? (item?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value ? formatNumberThreeDecimal(item?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value) : null);
                        filteredItem[key] = item?.exchangeMinInven !== null && item?.exchangeMinInven !== undefined && item?.exchangeMinInven !== '' ? formatNumberThreeDecimal(item?.exchangeMinInven) : null;
                        // filteredItem[key] = item?.exchange ?? (item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value ? formatNumberThreeDecimal(item?.data?.find((d: any) => d.type === "Exchange_Mininventory")?.value) : null);
                        break;
                    case 'total':
                        const change = item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0;
                        const exchange = item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value || 0;
                        const total = change + exchange;
                        filteredItem[key] = formatNumberThreeDecimal(total);
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformMinimumTabDailyKeys = (data: any) => {
    return data.map((item: any) => {
        const transformedItem: any = {};
        Object.keys(item).forEach((key) => {
            // Capitalize the first letter and replace underscores with spaces
            let newKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
            if (newKey == 'Change Min Inventory' || newKey == 'Exchange Min Inventory') {
                newKey += ' (MMBTU)'
            }else if(newKey == 'Exchange Min Invent'){
                newKey = "Exchange Min Inventory (MMBTU)"
            }
            transformedItem[newKey] = item[key];
        });
        return transformedItem;
    });
};

export const transformSumNomReportWeeklyAreaImbal = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day_text ? item?.gas_day_text : null;
                        break;
                    case 'imbalance':
                        filteredItem[key] = item?.imbalance !== null && item?.imbalance !== undefined ? formatNumberThreeDecimal(item?.imbalance) : null;
                        break;
                    case 'imbalance_percent':
                        filteredItem[key] = item?.imbalance_percent !== null && item?.imbalance_percent !== undefined ? item?.imbalance_percent : null;
                        break;
                    case 'park':
                        filteredItem[key] = item?.park !== null && item?.park !== undefined ? formatNumberThreeDecimal(item?.park) : null;
                        break;
                    case 'unpark':
                        filteredItem[key] = item?.unpark !== null && item?.unpark !== undefined ? formatNumberThreeDecimal(item?.unpark) : null;
                        break;
                    case 'change_min_invent':
                        filteredItem[key] = item?.change_min_invent !== null && item?.change_min_invent !== undefined ? formatNumberThreeDecimal(item?.change_min_invent) : null;
                        break;
                    case 'shrinkage':
                        filteredItem[key] = item?.shrinkage !== null && item?.shrinkage !== undefined ? formatNumberThreeDecimal(item?.shrinkage) : null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformSumNomReportWeeklyAreaMmbtu = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day_text ? item?.gas_day_text : null;
                        break;
                    case 'imbalance':
                        filteredItem[key] = item?.imbalance !== null && item?.imbalance !== undefined ? formatNumberThreeDecimal(item?.imbalance) : null;
                        break;
                    case 'imbalance_percent':
                        filteredItem[key] = item?.imbalance_percent !== null && item?.imbalance_percent !== undefined ? item?.imbalance_percent : null;
                        break;
                    case 'park':
                        filteredItem[key] = item?.park !== null && item?.park !== undefined ? formatNumberThreeDecimal(item?.park) : null;
                        break;
                    case 'unpark':
                        filteredItem[key] = item?.unpark !== null && item?.unpark !== undefined ? formatNumberThreeDecimal(item?.unpark) : null;
                        break;
                    case 'change_min_invent':
                        filteredItem[key] = item?.change_min_invent !== null && item?.change_min_invent !== undefined ? formatNumberThreeDecimal(item?.change_min_invent) : null;
                        break;
                    case 'shrinkage':
                        filteredItem[key] = item?.shrinkage !== null && item?.shrinkage !== undefined ? formatNumberThreeDecimal(item?.shrinkage) : null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformAllocationReview = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item?.allocation_status ? item?.allocation_status?.name : null;
                        break;
                    case 'system_allocation':
                        filteredItem[key] = item?.systemAllocation !== null ? formatNumberFourDecimal(item?.systemAllocation) : null;
                        break;
                    case 'previous_allocation_tpa_for_review':
                        filteredItem[key] = item?.previousAllocationTPAforReview !== null ? formatNumberFourDecimal(item?.previousAllocationTPAforReview) : null;
                        break;
                    case 'shipper_review_allocation':
                        filteredItem[key] = item?.allocation_management_shipper_review ? formatNumberFourDecimal(item?.allocation_management_shipper_review[0]?.shipper_allocation_review) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.create?.create_by?.first_name || ''} ${item?.create?.create_by?.last_name || ''} ${item?.create?.create_date ? formatDate(item?.create?.create_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformIntradayBaseInventory = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'gas_hour':
                        filteredItem[key] = item?.gas_hour ? item?.gas_hour : null;
                        break;
                    case 'timestamp':
                        filteredItem[key] = item?.timestamp ? formatDate(item?.timestamp) : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zoneObj ? item?.zoneObj?.name : null;
                        break;
                    case 'mode':
                        filteredItem[key] = item?.mode ? item?.mode : null;
                        break;
                    case 'hv':
                        filteredItem[key] = item?.hv ? formatNumberFourDecimal(item?.hv) : '0.0000';
                        break;
                    case 'base_inventory_value':
                        filteredItem[key] = item?.base_inventory_value ? formatNumberFourDecimal(item?.base_inventory_value) : '0.0000';
                        break;
                    case 'high_difficult_day':
                        filteredItem[key] = item?.high_difficult_day ? formatNumberFourDecimal(item?.high_difficult_day) : '0.0000';
                        break;
                    case 'high_red':
                        filteredItem[key] = item?.high_red ? formatNumberFourDecimal(item?.high_red) : '0.0000';
                        break;
                    case 'high_orange':
                        filteredItem[key] = item?.high_orange ? formatNumberFourDecimal(item?.high_orange) : '0.0000';
                        break;
                    case 'high_max':
                        filteredItem[key] = item?.high_max ? formatNumberFourDecimal(item?.high_max) : '0.0000';
                        break;
                    case 'alert_high':
                        filteredItem[key] = item?.alert_high ? formatNumberFourDecimal(item?.alert_high) : '0.0000';
                        break;
                    case 'alert_low':
                        filteredItem[key] = item?.alert_low ? formatNumberFourDecimal(item?.alert_low) : '0.0000';
                        break;
                    case 'low_orange':
                        filteredItem[key] = item?.low_orange ? formatNumberFourDecimal(item?.low_orange) : '0.0000';
                        break;
                    case 'low_red':
                        filteredItem[key] = item?.low_red ? formatNumberFourDecimal(item?.low_red) : '0.0000';
                        break;
                    case 'low_difficult_day':
                        filteredItem[key] = item?.low_difficult_day ? formatNumberFourDecimal(item?.low_difficult_day) : '0.0000';
                        break;
                    case 'low_max':
                        filteredItem[key] = item?.low_max ? formatNumberFourDecimal(item?.low_max) : '0.0000';
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformIntradayBaseInventoryShipper = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'gas_hour':
                        filteredItem[key] = item?.gas_hour ? item?.gas_hour : null;
                        break;
                    case 'timestamp':
                        filteredItem[key] = item?.timestamp ? formatDate(item?.timestamp) : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zoneObj ? item?.zoneObj?.name : null;
                        break;
                    case 'mode':
                        filteredItem[key] = item?.mode ? item?.mode : null;
                        break;
                    case 'group':
                        filteredItem[key] = item?.group ? item?.group?.name : null;
                        break;
                    case 'hv':
                        filteredItem[key] = item?.hv ? formatNumberFourDecimal(item?.hv) : '0.0000';
                        break;
                    case 'base_inventory_value':
                        filteredItem[key] = item?.base_inventory_value ? formatNumberFourDecimal(item?.base_inventory_value) : '0.0000';
                        break;
                    case 'high_difficult_day':
                        filteredItem[key] = item?.high_difficult_day ? formatNumberFourDecimal(item?.high_difficult_day) : '0.0000';
                        break;
                    case 'high_red':
                        filteredItem[key] = item?.high_red ? formatNumberFourDecimal(item?.high_red) : '0.0000';
                        break;
                    case 'high_orange':
                        filteredItem[key] = item?.high_orange ? formatNumberFourDecimal(item?.high_orange) : '0.0000';
                        break;
                    case 'high_max':
                        filteredItem[key] = item?.high_max ? formatNumberFourDecimal(item?.high_max) : '0.0000';
                        break;
                    case 'alert_high':
                        filteredItem[key] = item?.alert_high ? formatNumberFourDecimal(item?.alert_high) : '0.0000';
                        break;
                    case 'alert_low':
                        filteredItem[key] = item?.alert_low ? formatNumberFourDecimal(item?.alert_low) : '0.0000';
                        break;
                    case 'low_orange':
                        filteredItem[key] = item?.low_orange ? formatNumberFourDecimal(item?.low_orange) : '0.0000';
                        break;
                    case 'low_red':
                        filteredItem[key] = item?.low_red ? formatNumberFourDecimal(item?.low_red) : '0.0000';
                        break;
                    case 'low_difficult_day':
                        filteredItem[key] = item?.low_difficult_day ? formatNumberFourDecimal(item?.low_difficult_day) : '0.0000';
                        break;
                    case 'low_max':
                        filteredItem[key] = item?.low_max ? formatNumberFourDecimal(item?.low_max) : '0.0000';
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformCurtailmentAlloc = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'shipper_name':
                        filteredItem[key] = item?.shipper_name ? item?.shipper_name : null;
                        break;
                    case 'contract_code':
                        filteredItem[key] = item?.contract ? item?.contract : null;
                        break;
                    case 'nomination_value':
                        filteredItem[key] = item?.nomination_value !== null && item?.nomination_value !== undefined ? formatNumberFourDecimal(item?.nomination_value) : null;
                        break;
                    case 'remaining_capacity':
                        filteredItem[key] = item?.remaining_capacity !== null && item?.remaining_capacity !== undefined ? formatNumberFourDecimal(item?.remaining_capacity) : null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformShipperNomReportDetail = (dataMain: any, column?: any, extra_obj?: any) => {

    // extra_obj = {
    //     tabMainIndex: tabMainIndex, // จากหน้าแรก daily/weekly = 0, daily = 1, weekly = 2
    //     subTabIndex: subTabIndex, // จาก tab weekly -> tab ย่อยรายวัน sunday = 0, monday = 1, ... , saturday = 6
    //     tabEachZoneIndex: tabMain, // จากหน้า detail tab entry/exit = 0, concept point = 1
    // }

    if ((extra_obj?.tabMainIndex == 0 && extra_obj?.tabEachZoneIndex == 0) || (extra_obj?.tabMainIndex == 1 && extra_obj?.tabEachZoneIndex == 0)) {
        // case 1 export tab daily/weekly -> entry/exit
        // case 2 export tab daily -> entry/exit
        console.log('1');
        return dataMain?.map((item: any) => {
            let value_:any = "";
            let valueAll_:any = "";
            if(item?.nom?.nomination_type_id == 2 && extra_obj?.gasDay) { // 2 = weekly
                const key_ = Object.keys(item?.headData || {}).find((k) => item.headData[k] === extra_obj.gasDay) || ''
                // value_ = (item.data_temp?.[key_] || item.data_temp?.[key_] == 0) ? formatNumberThreeDecimal((parseToNumber(item.data_temp?.[key_]) || 0) / 24) : '';
                value_ = (item.data_temp?.[key_] || item.data_temp?.[key_] == 0) ? formatNumberThreeDecimal((parseToNumber(item.data_temp?.[key_]) || 0)) : '';
                // value_ = (item?.data_temp[key_] === "0.000" || item?.data_temp[key_] === 0) ? 0 : ((!!parseToNumber(item?.data_temp[key_] ?? null) && (parseToNumber(item?.data_temp[key_] ?? null) || 0) / 24) || '')
                
                // valueAll_ = item.data_temp?.[key_] 
                valueAll_ = value_ !== "" ? value_ * 24 : "" 
                // valueAll_ = item?.nom?.nomination_type_id === 2 && value_ !== "" ? (value_?.toFixed(3) * 24) : item?.data_temp[key_]


            }
            const filteredItem: any = {};
            Object.keys(column).forEach(key => {
                if (column[key]) {
                    switch (key) {
                        case 'supply_demand':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["1"] : null;
                            break;
                        case 'area':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["2"] : null;
                            break;
                        case 'nomination_point':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["3"] : null;
                            break;
                        case 'unit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["9"] : null;
                            break;
                        case 'type':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["6"] : null;
                            break;
                        case 'entry_exit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["10"] : null;
                            break;
                        case 'wi':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["11"] : null;
                            // filteredItem[key] = !isNaN(item?.data_temp["11"]) ? item?.data_temp["11"] : null;
                            filteredItem[key] = item?.data_temp['11'] ? formatNumberThreeDecimal(item?.data_temp['11']) : '';
                            break;
                        case 'hv':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["12"] : null;
                            // filteredItem[key] = !isNaN(item?.data_temp["12"]) ? item?.data_temp["12"] : null;
                            // console.log(`item?.data_temp['12'] : `, item?.data_temp['12']);
                            // console.log(`item?.data_temp['12'] ? formatNumberThreeDecimal(item?.data_temp['12']) : '' : `, item?.data_temp['12'] ? formatNumberThreeDecimal(item?.data_temp['12']) : '');
                            // console.log('- -- - - -');
                            filteredItem[key] = item?.data_temp['12'] ? formatNumberThreeDecimal(item?.data_temp['12']) : '';
                            break;
                        case 'sg':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["13"] : null;
                            // filteredItem[key] = !isNaN(item?.data_temp["13"]) ? item?.data_temp["13"] : null;
                            filteredItem[key] = item?.data_temp['13'] ? formatNumberThreeDecimal(item?.data_temp['13']) : '';
                            break;

                        case 'h1':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["14"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["14"]) : null;
                            // filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['14'])) || ''
                            
                            break;
                        case 'h2':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["15"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["15"]) : null;
                            break;
                        case 'h3':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["16"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["16"]) : null;
                            break;
                        case 'h4':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["17"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["17"]) : null;
                            break;
                        case 'h5':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["18"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["18"]) : null;
                            break;
                        case 'h6':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["19"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["19"]) : null;
                            break;
                        case 'h7':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["20"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["20"]) : null;
                            break;
                        case 'h8':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["21"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["21"]) : null;
                            break;
                        case 'h9':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["22"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["22"]) : null;
                            break;
                        case 'h10':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["23"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["23"]) : null;
                            break;
                        case 'h11':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["24"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["24"]) : null;
                            break;
                        case 'h12':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["25"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["25"]) : null;
                            break;
                        case 'h13':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["26"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["26"]) : null;
                            break;
                        case 'h14':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["27"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["27"]) : null;
                            break;
                        case 'h15':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["28"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["28"]) : null;
                            break;
                        case 'h16':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["29"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["29"]) : null;
                            break;
                        case 'h17':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["30"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["30"]) : null;
                            break;
                        case 'h18':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["31"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["31"]) : null;
                            break;
                        case 'h19':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["32"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["32"]) : null;
                            break;
                        case 'h20':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["33"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["33"]) : null;
                            break;
                        case 'h21':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["34"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["34"]) : null;
                            break;
                        case 'h22':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["35"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["35"]) : null;
                            break;
                        case 'h23':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["36"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["36"]) : null;
                            break;
                        case 'h24':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["37"] : null;
                            filteredItem[key] = value_ ? value_ : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["37"]) : null;
                            break;
                        case 'total':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["38"] : null;
                            filteredItem[key] = (valueAll_ == 0 && item?.nom?.nomination_type_id == 2 && extra_obj?.gasDay) ? formatNumberThreeDecimalNom(valueAll_) : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["38"]) : null;
                            console.log((valueAll_ == 0 && item?.nom?.nomination_type_id == 2 && extra_obj?.gasDay) ? formatNumberThreeDecimalNom(valueAll_) : item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["38"]) : null);
                            console.log('item?.data_temp["38"] : ', item?.data_temp["38"]);
                            break;
                    }
                }
            });

            return filteredItem
        })

    } else if (extra_obj?.tabMainIndex == 0 || (extra_obj?.tabMainIndex == 1 && extra_obj?.tabEachZoneIndex == 1)) {
        // case 3 export tab daily -> concept point
        console.log('2');
        return dataMain?.map((item: any) => {

            let value_:any = "";
            let valueAll_:any = "";
            if(item?.nom?.nomination_type_id == 2 && extra_obj?.gasDay) { // 2 = weekly
                const key_ = Object.keys(item?.headData || {}).find((k) => item.headData[k] === extra_obj.gasDay) || ''
                // value_ = (item.data_temp?.[key_] || item.data_temp?.[key_] == 0) ? formatNumberThreeDecimal((parseToNumber(item.data_temp?.[key_]) || 0) / 24) : '';
                value_ = (item?.data_temp[key_] === "0.000" || item?.data_temp[key_] === 0) ? 0 : ((!!parseToNumber(item?.data_temp[key_] ?? null) && (parseToNumber(item?.data_temp[key_] ?? null) || 0) / 24) || '')
                
                // valueAll_ = item.data_temp?.[key_]
                valueAll_ = item?.nom?.nomination_type_id === 2 && value_ !== "" ? (value_?.toFixed(3) * 24) : item?.data_temp[key_]


            }

            const filteredItem: any = {};
            Object.keys(column).forEach(key => {
                if (column[key]) {
                    switch (key) {
                        case 'supply_demand':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["1"] : null;
                            break;
                        case 'concept_point':
                            filteredItem[key] = item?.data_temp["3"]?.trim() !== "" ? item?.data_temp["3"] :
                                item?.data_temp["4"]?.trim() !== "" ? item?.data_temp["4"] :
                                    item?.data_temp["5"]?.trim() !== "" ? item?.data_temp["5"] : ''
                            break;
                        case 'concept_id':
                            filteredItem[key] = item?.data_temp["3"]?.trim() !== "" ? item?.data_temp["3"] :
                                item?.data_temp["4"]?.trim() !== "" ? item?.data_temp["4"] :
                                    item?.data_temp["5"]?.trim() !== "" ? item?.data_temp["5"] : ''
                            break;
                        case 'unit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["9"] : null;
                            break;
                        case 'entry_exit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["10"] : null;
                            break;

                        case 'h1':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["14"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["14"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['14'])) || ''

                            break;
                        case 'h2':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["15"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["15"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['15'])) || ''
                            break;
                        case 'h3':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["16"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["16"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['16'])) || ''
                            break;
                        case 'h4':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["17"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["17"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['17'])) || ''
                            break;
                        case 'h5':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["18"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["18"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['18'])) || ''
                            break;
                        case 'h6':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["19"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["19"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['19'])) || ''
                            break;
                        case 'h7':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["20"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["20"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['20'])) || ''
                            break;
                        case 'h8':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["21"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["21"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['21'])) || ''
                            break;
                        case 'h9':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["22"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["22"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['22'])) || ''
                            break;
                        case 'h10':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["23"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["23"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['23'])) || ''
                            break;
                        case 'h11':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["24"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["24"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['24'])) || ''
                            break;
                        case 'h12':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["25"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["25"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['25'])) || ''
                            break;
                        case 'h13':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["26"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["26"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['26'])) || ''
                            break;
                        case 'h14':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["27"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["27"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['27'])) || ''
                            break;
                        case 'h15':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["28"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["28"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['28'])) || ''
                            break;
                        case 'h16':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["29"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["29"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['29'])) || ''
                            break;
                        case 'h17':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["30"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["30"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['30'])) || ''
                            break;
                        case 'h18':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["31"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["31"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['31'])) || ''
                            break;
                        case 'h19':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["32"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["32"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['32'])) || ''
                            break;
                        case 'h20':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["33"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["33"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['33'])) || ''
                            break;
                        case 'h21':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["34"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["34"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['34'])) || ''
                            break;
                        case 'h22':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["35"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["35"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['35'])) || ''
                            break;
                        case 'h23':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["36"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["36"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['36'])) || ''
                            break;
                        case 'h24':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["37"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["37"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_) : formatNumberThreeDecimal(item?.data_temp['37'])) || ''
                            break;
                        case 'total':
                            // filteredItem[key] = item?.data_temp ? item?.data_temp["38"] : null;
                            // filteredItem[key] = item?.data_temp ? formatNumberThreeDecimalNom(item?.data_temp["38"]) : null;
                            filteredItem[key] = (item?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(valueAll_) : formatNumberThreeDecimal(item?.data_temp['38'])) || ''
                            break;
                    }
                }
            });

            return filteredItem;
        });
    } else if (extra_obj?.tabMainIndex == 0 || (extra_obj?.tabMainIndex == 2 && extra_obj?.tabEachZoneIndex == 1)) {
        // case 4 export tab weekly --> concept point
        console.log('3');
        return dataMain?.map((item: any) => {
            const filteredItem: any = {};
            Object.keys(column).forEach(key => {
                if (column[key]) {
                    switch (key) {
                        case 'supply_demand':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["1"] : null;
                            break;
                        case 'concept_point':
                            filteredItem[key] = item?.data_temp["3"]?.trim() !== "" ? item?.data_temp["3"] :
                                item?.data_temp["4"]?.trim() !== "" ? item?.data_temp["4"] :
                                    item?.data_temp["5"]?.trim() !== "" ? item?.data_temp["5"] : ''
                            break;
                        case 'concept_id':
                            filteredItem[key] = item?.data_temp["3"]?.trim() !== "" ? item?.data_temp["3"] :
                                item?.data_temp["4"]?.trim() !== "" ? item?.data_temp["4"] :
                                    item?.data_temp["5"]?.trim() !== "" ? item?.data_temp["5"] : ''
                            break;
                        case 'unit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["9"] : null;
                            break;
                        case 'entry_exit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["10"] : null;
                            break;
                        case 'week_day':
                            if (extra_obj?.day_text == "Sunday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["14"] : null;
                            } else if (extra_obj?.day_text == "Monday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["15"] : null;
                            } else if (extra_obj?.day_text == "Tuesday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["16"] : null;
                            } else if (extra_obj?.day_text == "Wednesday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["17"] : null;
                            } else if (extra_obj?.day_text == "Thursday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["18"] : null;
                            } else if (extra_obj?.day_text == "Friday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["19"] : null;
                            } else if (extra_obj?.day_text == "Saturday") {
                                filteredItem[key] = item?.data_temp ? item?.data_temp["20"] : null;
                            }
                            break;
                    }
                }
            });

            return filteredItem;
        });
    } else if (extra_obj?.tabMainIndex == 2 && extra_obj?.tabEachZoneIndex < 7) {
        console.log('4');
        return dataMain?.map((item: any) => {
            const filteredItem: any = {};
            Object.keys(column).forEach(key => {
                if (column[key]) {
                    switch (key) {
                        case 'supply_demand':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["1"] : null;
                            break;
                        case 'area':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["2"] : null;
                            break;
                        case 'nomination_point':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["3"] : null;
                            break;
                        case 'unit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["9"] : null;
                            break;
                        case 'type':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["6"] : null;
                            break;
                        case 'entry_exit':
                            filteredItem[key] = item?.data_temp ? item?.data_temp["10"] : null;
                            break;
                        case 'wi':
                            filteredItem[key] = !isNaN(item?.data_temp["11"]) ? formatNumberThreeDecimal(item?.data_temp["11"]) : null;
                            break;
                        case 'hv':
                            filteredItem[key] = !isNaN(item?.data_temp["12"]) ? formatNumberThreeDecimal(item?.data_temp["12"]) : null;
                            break;
                        case 'sg':
                            filteredItem[key] = !isNaN(item?.data_temp["13"]) ? formatNumberThreeDecimal(item?.data_temp["13"]) : null;
                            break;
                        case 'week_day':
                            if (extra_obj?.day_text == "Sunday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["14"]) : null;
                            } else if (extra_obj?.day_text == "Monday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["15"]) : null;
                            } else if (extra_obj?.day_text == "Tuesday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["16"]) : null;
                            } else if (extra_obj?.day_text == "Wednesday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["17"]) : null;
                            } else if (extra_obj?.day_text == "Thursday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["18"]) : null;
                            } else if (extra_obj?.day_text == "Friday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["19"]) : null;
                            } else if (extra_obj?.day_text == "Saturday") {
                                filteredItem[key] = item?.data_temp ? formatNumberThreeDecimal(item?.data_temp["20"]) : null;
                            }
                            break;
                    }
                }
            });

            return filteredItem;
        });
    }

}

export const transformBalanceAdjustAccumulateImbalance = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'gas_day':
                        filteredItem[key] = item?.gas_day ? dayjs(item?.gas_day).format("DD/MM/YYYY") : null;
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.group ? item?.group?.name : null;
                        break;
                    case 'zone':
                        filteredItem[key] = item?.zone_obj ? item?.zone_obj?.name : null;
                        break;
                    case 'adjust_imbalance':
                        filteredItem[key] = item?.adjust_imbalance !== null && item?.adjust_imbalance !== undefined ? formatNumberFourDecimal(item?.adjust_imbalance) : null;
                        break;
                    case 'daily_imbalance':
                        filteredItem[key] = item?.dailyAccIm !== null && item?.dailyAccIm !== undefined ? formatNumberFourDecimal(item?.dailyAccIm) : null;
                        break;
                    case 'daily_final_imbalance':
                        filteredItem[key] = item?.finalDailyAccIm !== null && item?.finalDailyAccIm !== undefined ? formatNumberFourDecimal(item?.finalDailyAccIm) : null;
                        break;

                    case 'intraday_imbalance':
                        filteredItem[key] = item?.intradayAccIm !== null && item?.intradayAccIm !== undefined ? formatNumberFourDecimal(item?.intradayAccIm) : null;
                        break;
                    case 'intraday_final_imbalance':
                        filteredItem[key] = item?.finalIntradayAccIm !== null && item?.finalIntradayAccIm !== undefined ? formatNumberFourDecimal(item?.finalIntradayAccIm) : null;
                        break;

                    case 'comment':
                        filteredItem[key] = item.comment?.map((d: any) => d.remark).join(", ") || null;
                        break;

                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSecPlusSeven(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformZone = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'entry_exit':
                        filteredItem[key] = item?.entry_exit?.name || null;
                        break;
                    case 'zone_name':
                        filteredItem[key] = item?.name || null;
                        break;
                    case 'description':
                        filteredItem[key] = item?.description || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'created_by':
                        filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDate(item?.create_date) : ''}` || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformUser = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'login_mode':
                        filteredItem[key] = item?.account_manage?.[0]?.mode_account?.name || null;
                        break;
                    case 'status':
                        filteredItem[key] = item?.status ? "Active" : "Inactive";
                        break;
                    case 'id_name':
                        filteredItem[key] = item?.user_id || null;
                        break;
                    case 'company_name':
                        filteredItem[key] = item?.account_manage?.[0]?.group?.name || null;
                        break;
                    case 'user_type':
                        filteredItem[key] = item?.account_manage?.[0]?.user_type?.name || null;
                        break;
                    case 'division_name':
                        filteredItem[key] = item?.account_manage?.[0]?.division?.division_name || null;
                        break;
                    case 'first_name':
                        filteredItem[key] = item?.first_name || null;
                        break;
                    case 'last_name':
                        filteredItem[key] = item?.last_name || null;
                        break;
                    case 'type':
                        filteredItem[key] = item?.type_account?.name || null;
                        break;
                    case 'role_default':
                        filteredItem[key] = item?.account_manage?.[0]?.account_role?.[0]?.role?.name || null;
                        break;
                    case 'telephone':
                        filteredItem[key] = item?.telephone || null;
                        break;
                    case 'email':
                        filteredItem[key] = item?.email || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'update_by':
                        filteredItem[key] = `${item?.updated_by_account?.first_name || ''} ${item?.updated_by_account?.last_name || ''} ${formatDateTimeSec(item?.update_date) || ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformAlloManage = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item?.allocation_status?.name || null;
                        break;
                    case 'nominated_value':
                        filteredItem[key] = item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : '';
                        break;
                    case 'system_allocation':
                        filteredItem[key] = item?.systemAllocation !== null && item?.systemAllocation !== undefined ? formatNumberFourDecimal(item?.systemAllocation) : '';
                        break;
                    case 'intraday_system_allocation':
                        filteredItem[key] = item?.intradaySystem !== null && item?.intradaySystem !== undefined ? formatNumberFourDecimal(item?.intradaySystem) : '';
                        break;
                    case 'shipper_review_allocation':
                        filteredItem[key] = item?.allocation_management_shipper_review ? formatNumberFourDecimal(item?.allocation_management_shipper_review[0]?.shipper_allocation_review) : '';
                        break;
                    case 'updated_by':
                        // filteredItem[key] = `${item?.updated_by_account?.first_name || ''} ${item?.updated_by_account?.last_name || ''} ${formatDate(item?.update_date) || ''}` || null;
                        // filteredItem[key] = `${item?.create?.create_by?.first_name || ''} ${item?.create?.create_by?.last_name || ''} ${formatDate(item?.create?.create_date) || ''}` || null;
                        filteredItem[key] = `${item?.create?.create_by?.first_name || ''} ${item?.create?.create_by?.last_name || ''} ${formatDateTimeSec(item?.create?.create_date) || ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformContractPointModalView = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'contract_point':
                        filteredItem[key] = item?.contract_point || null;
                        break;
                    case 'entry_exit':
                        filteredItem[key] = item.entry_exit_id == 1 ? 'Entry' : 'Exit';
                        break;
                    case 'description':
                        filteredItem[key] = item.description || null;
                        break;
                    case 'zone':
                        filteredItem[key] = item.zone_id || null;
                        break;
                    case 'area':
                        filteredItem[key] = item.area_id || null;
                        break;
                    case 'contract_point_start_date':
                        filteredItem[key] = item.contract_point_start_date ? dayjs(item.contract_point_start_date).format("DD/MM/YYYY") : '';
                        break;
                    case 'contract_point_end_date':
                        filteredItem[key] = item.contract_point_end_date ? dayjs(item.contract_point_end_date).format("DD/MM/YYYY") : '';
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformNomUploadTemplateForShipper = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'document_type':
                        filteredItem[key] = item?.nomination_type?.document_type || null;
                        break;
                    case 'file':
                        // filteredItem[key] = item.upload_template_for_shipper_file?.map((d: any) => d.url).join(",    ") || null;
                        // History : Export Column File ลิ้งขึ้นซ้ำ และแสดงแค่ลิ้งล่าสุดของ Row นั้น และตัดบรรทัดไม่ต้องแสดงยาวมาก https://app.clickup.com/t/86etzch8c
                        filteredItem[key] = item.upload_template_for_shipper_file?.[0]?.url || null;
                        break;
                    case 'comment':
                        // filteredItem[key] = item.upload_template_for_shipper_comment?.map((d: any) => d.comment).join(", ") || null;
                        filteredItem[key] = item.upload_template_for_shipper_comment?.map((d: any) => d.comment).join('\n') || null;
                        break;
                    case 'updated_by':
                        // filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformCapaPublicRemark = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'remark':
                        filteredItem[key] = item?.remark || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformBookingTemplate = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'term':
                        filteredItem[key] = item?.term_type ? item.term_type?.name : null;
                        break;
                    case 'file_period':
                        filteredItem[key] =
                            item?.file_period_mode == 1 ?
                                `Day${item?.file_period !== 1 && 's'}`
                                : item?.file_period_mode == 2 ?
                                    `Month${item?.file_period !== 1 && 's'}`
                                    : `Year${item?.file_period !== 1 && 's'}`
                        break;
                    case 'min':
                        filteredItem[key] = item?.min ? item.min : null;
                        break;
                    case 'max':
                        filteredItem[key] = item?.max ? item.max : null;
                        break;
                    case 'file_start_date':
                        filteredItem[key] =
                            item?.file_start_date_mode == 1 ?
                                `Every Day`
                                : item?.file_start_date_mode == 2 ?
                                    `Fix Day ${item?.fixdayday} Day`
                                    : `Today + ${item?.todayday} Day`
                        break;
                    case 'shadow_time':
                        filteredItem[key] = item?.shadow_time !== null && item?.shadow_time !== undefined ? item.shadow_time : null;
                        break;
                    case 'unit':
                        filteredItem[key] =
                            item?.term_type_id == 4 ?
                                `Days`
                                : item?.term_type_id < 4 && `Months`
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformReleaseSubmission = (dataMain: any, column?: any) => {

    const data = dataMain?.map((item: any) => {
        const subItem = item.map((subItem: any) => {
            const filteredItem: any = {};
            Object.keys(column).forEach(key => {
                if (column[key]) {
                    switch (key) {
                        case 'contract_point':
                            filteredItem[key] = subItem?.temp_contract_point || null;
                            break;
                        case 'contracted_mmbtu_d':
                            filteredItem[key] = subItem?.total_contracted_mmbtu_d || null;
                            break;
                        case 'contracted_mmscfd':
                            filteredItem[key] = subItem?.total_contracted_mmscfd || null;
                            break;
                        case 'release_mmbtud':
                            filteredItem[key] = subItem?.total_release_mmbtu_d || null;
                            break;
                        case 'release_mmscfd':
                            filteredItem[key] = subItem?.total_release_mmscfd || null;
                            break;
                        case 'start_date':
                            filteredItem[key] = subItem?.temp_start_date || null;
                            break;
                        case 'end_date':
                            if (subItem?.temp_end_date) {
                                let tempEndDate = dayjs(subItem?.temp_end_date, 'DD/MM/YYYY')
                                // if (subItem?.is_terminate != true) { // มีไว้ทำไมหว่า
                                //     tempEndDate = tempEndDate.add(1, 'day')
                                // }
                                filteredItem[key] = tempEndDate.format('DD/MM/YYYY')
                            }
                            else {
                                filteredItem[key] = null;
                            }
                            break;
                        case 'entry_exit':
                            filteredItem[key] = subItem?.entry_exit?.name || null;
                            break;
                    }
                }
            });
            return filteredItem;
        })
        const totalReleaseMmbtud = subItem.reduce((accumulator: any, value: any) => accumulator ? accumulator + value.release_mmbtud : value.release_mmbtud, null)
        subItem.push({
            "contract_point": "Total",
            "entry_exit": null,
            "start_date": null,
            "end_date": null,
            "contracted_mmbtu_d": null,
            "contracted_mmscfd": null,
            "release_mmscfd": null,
            "release_mmbtud": totalReleaseMmbtud
        })
        return subItem
        // [
        //     ...subItem,
        //     {
        //         'contract_point': null,
        //         'contracted_mmbtu_d': null,
        //         'contracted_mmscfd': null,
        //         'start_date': null,
        //         'end_date': null,
        //         'entry_exit': null,
        //     }
        // ]
    });
    return data.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])
}

export const transformRoleMgn = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'user_type':
                        filteredItem[key] = item?.user_type?.name || null;
                        break;
                    case 'role_name':
                        filteredItem[key] = item?.name || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                    case 'update_permission_by_account':
                        filteredItem[key] = `${item?.update_permission_by_account?.first_name || ''} ${item?.update_permission_by_account?.last_name || ''} ${item?.update_permission_date ? formatDate(item?.update_permission_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformSystemLogin = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'login_mode':
                        filteredItem[key] = item?.mode_account ? item?.mode_account?.name + " Mode" : null;
                        break;
                    case 'role':
                        filteredItem[key] = item?.role ? item?.role?.name : null;
                        break;
                    case 'user':
                        // filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        filteredItem[key] = item?.system_login_account?.map((d: any) => d?.account?.email).join(", ") || null;
                        break;
                    case 'updated_by':
                        // filteredItem[key] = item?.update_date ? formatDateTimeSec(item?.update_date) : null;
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformTermCondition = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'topic':
                        filteredItem[key] = item?.topic || null;
                        break;
                    case 'file':
                        filteredItem[key] = item?.url ? cutUploadFileName(item?.url) : '';
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformAnnouncement = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'status':
                        filteredItem[key] = item?.status ? 'Active' : 'Inactive';
                        break;
                    case 'topic':
                        filteredItem[key] = item?.topic || null;
                        break;
                    case 'detail':
                        filteredItem[key] = item?.detail || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : null;
                        break;
                    case 'end_date':
                        filteredItem[key] = item?.end_date ? formatDateNoTime(item.end_date) : null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformConfigModeZoneBaseInventory = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any, index: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'zone':
                        filteredItem[key] = item?.zone?.name || null;
                        break;
                    case 'mode':
                        filteredItem[key] = item?.mode || null;
                        break;
                    case 'start_date':
                        filteredItem[key] = item?.start_date ? formatDateNoTime(item.start_date) : '';
                        break;
                    case 'updated_by':
                        let isLast = index == dataMain.length - 1
                        if (isLast) {
                            filteredItem[key] = `${item?.create_by_account?.first_name || ''} ${item?.create_by_account?.last_name || ''} ${item?.create_date ? formatDateTimeSecPlusSeven(item?.create_date) : ''}` || null;
                        } else {
                            filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSecPlusSeven(item?.update_date) : ''}` || null;
                        }

                        break;
                }
            }
        });
        return filteredItem;
    });
}

export const transformBalanceOperationFlowAndInstructedFlow = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {

            let flow_type = ""
            switch (item?.level) {
                case "OFO":
                    // flow_type = "OPERATION FLOW"
                    flow_type = "OPERATION FLOW ORDER"
                    break;
                case "DD":
                    // flow_type = "DIFFICULT DAY FLOW"
                    flow_type = "DIFFICULT DAY"
                    break;
                case "IF":
                    flow_type = "INSTRUCTED FLOW"
                    break;
            }

            if (column[key]) {
                switch (key) {
                    case 'acc_imbalance':
                        filteredItem[key] = item?.accImb_or_accImbInv !== null && item?.accImb_or_accImbInv !== undefined ? formatNumberFourDecimal(item?.accImb_or_accImbInv) : '';
                        break;
                    case 'acc_margin':
                        filteredItem[key] = item?.accMargin !== null && item?.accMargin !== undefined ? formatNumberFourDecimal(item?.accMargin) : '';
                        break;
                    case 'flow_type':
                        filteredItem[key] = item?.level ? flow_type : '';
                        break;
                    case 'energy_adjustment_mmbtu':
                        filteredItem[key] = item?.energyAdjust !== null && item?.energyAdjust !== undefined ? formatNumberFourDecimal(item?.energyAdjust) : '';
                        break;
                    case 'energy_flow_rate_adjustment_mmbtuh':
                        filteredItem[key] = item?.energyAdjustRate_mmbtuh !== null && item?.energyAdjustRate_mmbtuh !== undefined ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtuh) : '';
                        break;
                    case 'energy_flow_rate_adjustment_mmbtud':
                        filteredItem[key] = item?.energyAdjustRate_mmbtud !== null && item?.energyAdjustRate_mmbtud !== undefined ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtud) : '';
                        break;
                    case 'volume_adjustment_mmbtu':
                        filteredItem[key] = item?.volumeAdjust !== null && item?.volumeAdjust !== undefined ? formatNumberFourDecimal(item?.volumeAdjust) : '';
                        break;
                    case 'volume_flow_rate_adjustment_mmscfh':
                        // filteredItem[key] = item?.volumeAdjustRate_mmscfh !== null && item?.volumeAdjustRate_mmscfh !== undefined ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfh) : '';
                        filteredItem[key] = item?.volumeAdjustRate_mmscfh !== null && item?.volumeAdjustRate_mmscfh !== undefined ? formatNumberSixDecimalNom(item?.volumeAdjustRate_mmscfh) : '';  // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                        break;
                    case 'volume_flow_rate_adjustment_mmscfd':
                        // filteredItem[key] = item?.volumeAdjustRate_mmscfd !== null && item?.volumeAdjustRate_mmscfd !== undefined ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfd) : '';
                        filteredItem[key] = item?.volumeAdjustRate_mmscfd !== null && item?.volumeAdjustRate_mmscfd !== undefined ? formatNumberSixDecimalNom(item?.volumeAdjustRate_mmscfd) : ''; // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                        break;
                    case 'resolvedTime_hr':
                        filteredItem[key] = item?.resolveHour ? item?.resolveHour : '';
                        break;
                    case 'hv_btu_scf':
                        filteredItem[key] = item?.heatingValue ? item?.heatingValue : '';
                        break;
                    case 'updated_by':
                        // History : Export คอลัมน์ Updated By ขาด วินาที https://app.clickup.com/t/86eudxrmz
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDateTimeSec(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}


export const transformEmailNotificationManagement = (dataMain: any, column?: any) => {
    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'active':
                        filteredItem[key] = item?.active ? 'Active' : 'Inactive';
                        break;
                    case 'activity':
                        filteredItem[key] = item?.activity?.name || null;
                        break;
                    case 'module':
                        filteredItem[key] = item?.menus?.name || null;
                        break;
                    case 'subject':
                        filteredItem[key] = item?.subject || null;
                        break;
                    case 'updated_by':
                        filteredItem[key] = `${item?.update_by_account?.first_name || ''} ${item?.update_by_account?.last_name || ''} ${item?.update_date ? formatDate(item?.update_date) : ''}` || null;
                        break;
                }
            }
        });
        return filteredItem;
    });
}



export const transformDailyAdjust = (dataMain: any, column?: any) => {

    return dataMain?.flatMap((zone: any) =>
        zone?.groups?.flatMap((group: any) =>
            group?.items?.map((item: any) => {
                const filteredItem: any = {};

                Object.keys(column).forEach(key => {
                    if (column[key]) {
                        switch (key) {
                            case 'current_time':
                            case 'time':
                                filteredItem[key] = item?.timeShow?.time || '';
                                break;
                            case 'shipper_name':
                                filteredItem[key] = item?.shipper_name || '';
                                break;
                            case 'nomination_point':
                                filteredItem[key] = item?.point || '';
                                break;
                            case 'nomination_value':
                                // filteredItem[key] = item?.timeShow?.value ? formatNumberThreeDecimal(item?.timeShow?.value) : '';
                                filteredItem[key] = item?.timeShow?.valueMmscfd ? formatNumberThreeDecimal(item?.timeShow?.valueMmscfd) : '';
                                break;
                        }
                    }
                });

                return filteredItem;
            }) || []
        ) || []
    );
};

export const transformDailyAdjustTabDetail = (dataMain: any, column?: any, displayUnit?: string) => {

    // return dataMain?.flatMap((zone: any) =>
    //     zone?.groups?.flatMap((group: any) =>
    //         group?.items?.map((item: any) => {
    //             const filteredItem: any = {};

    //             Object.keys(column).forEach(key => {
    //                 if (column[key]) {
    //                     switch (key) {
    //                         case 'current_time':
    //                         case 'time':
    //                             filteredItem[key] = item?.time || '';
    //                             break;
    //                         case 'shipper_name':
    //                             filteredItem[key] = item?.shipper_name || '';
    //                             break;
    //                         case 'nomination_point':
    //                             filteredItem[key] = item?.point || '';
    //                             break;
    //                         case 'nomination_value':
    //                             filteredItem[key] = item?.value !== null && item?.value !== undefined ? formatNumberThreeDecimal(item?.value) : '';
    //                             break;
    //                         default:
    //                             break;
    //                     }
    //                 }
    //             });

    //             return filteredItem;
    //         }) || []
    //     ) || []
    // );

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};
        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    // case 'current_time':
                    case 'time':
                        filteredItem[key] = item?.time || '';
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.shipper_name || '';
                        break;
                    case 'nomination_point':
                        filteredItem[key] = item?.point || '';
                        break;
                    case 'nomination_value':
                        // filteredItem[key] = item?.value !== null && item?.value !== undefined ? formatNumberThreeDecimal(item?.value) : '';

                        const value = displayUnit == 'MMBTUD' ? item?.time  == 'Total' ? item?.valuePerHour : item?.value : item?.time  == 'Total' ? item?.valueMmscfh : item?.valueMmscfd;
                        filteredItem[key] = ((value !== null && value !== undefined) ? displayUnit == 'MMBTUD' ? formatNumberThreeDecimal(value) : formatNumberSixDecimal(value) : '')
                        break;
                }
            }
        });
        return filteredItem;
    });
};

export const transformDailyAdjust2ForTable2 = (dataMain: any, column?: any) => {

    return dataMain?.map((item: any) => {
        const filteredItem: any = {};

        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'current_time':
                    case 'time':
                        filteredItem[key] = item?.timeShow[0]?.time || '';
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.shipper_name || '';
                        break;
                    case 'nomination_point':
                        filteredItem[key] = item?.point || '';
                        break;
                    case 'nomination_value':
                        // filteredItem[key] = item?.timeShow[0]?.value ? formatNumberThreeDecimal(item?.timeShow[0]?.value) : '';
                        filteredItem[key] = item?.timeShow[0]?.valueMmscfd ? formatNumberThreeDecimal(item?.timeShow[0]?.valueMmscfd) : '';
                        break;
                }
            }
        });

        return filteredItem;
    });
};


// หน้า daily adjustment report --> tab detail
// ใช้กับข้อมูล table ล่าง
export const transformDailyAdjustTable2 = (dataMain: any, column?: any) => {

    return dataMain[0]?.groups[0]?.items.map((item: any) => {
        const filteredItem: any = {};

        Object.keys(column).forEach(key => {
            if (column[key]) {
                switch (key) {
                    case 'current_time':
                        // filteredItem[key] = item?.timeShow ? item?.timeShow[0]?.time : "";
                        filteredItem[key] = item?.timeShow ? item?.timeShow?.time : "";
                        break;
                    case 'time':
                        // filteredItem[key] = item?.timeShow ? item?.timeShow[0]?.time : "";
                        filteredItem[key] = item?.timeShow ? item?.timeShow?.time : "";
                        break;
                    case 'shipper_name':
                        filteredItem[key] = item?.shipper_name ? item?.shipper_name : '';
                        break;
                    case 'nomination_point':
                        filteredItem[key] = item?.point ? item?.point : '';
                        break;
                    case 'nomination_value':
                        // filteredItem[key] = item?.timeShow ? item?.timeShow[0]?.value : '';
                        filteredItem[key] = item?.timeShow ? item?.timeShow?.value : '';
                        break;
                }
            }
        });

        return filteredItem;
    });

};