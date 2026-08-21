export type AccountData = {
  id: number;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export type AreaData = {
  id: number;
  name?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num?: number | null;
  update_date_num?: number | null;
  create_by?: number | null;
  update_by?: number | null;
  active?: boolean | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  area_nominal_capacity?: number | null;
  zone_id?: number | null;
  entry_exit_id?: number | null;
  color?: string | null;
  supply_reference_quality_area?: number | null;
}

export type CustomerTypeData = {
  id: number;
  name?: string | null;
  entry_exit_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num: number | null;
  update_date_num: number | null;
  create_by: number | null;
  update_by: number | null;
}

export type EntryExitData = {
  id: number;
  name?: string | null;
  color?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num?: number | null;
  update_date_num?: number | null;
  create_by?: number | null;
  update_by?: number | null;
}

export type PointTypeData = {
  id: number;
  name?: string | null;
}

export type MeteredPointData = {
  id: number,
  metered_id?: string | null;
  metered_point_name?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num?: number | null;
  update_date_num?: number | null;
  create_by?: number | null;
  update_by?: number | null;
  point_type_id?: number | null;
  entry_exit_id?: number | null;
  zone_id?: number | null;
  area_id?: number | null;
  non_tpa_point_id?: number | null;
  nomination_point_id?: number | null;
  customer_type_id?: number | null;
  ref_id?: number | null;
  point_type?: PointTypeData | null;
  entry_exit?: EntryExitData| null;
  customer_type?: CustomerTypeData | null;
  zone?: ZoneData | null;
  area?: AreaData | null;
  non_tpa_point?: NonTpaPointData | null;
  nomination_point: NominationPointData | null;
  create_by_account?: AccountData | null;
  update_by_account?: AccountData | null;
}

export type NominationPointData = {
  id: number;
  nomination_point?: string | null;
  description?: string | null;
  entry_exit_id?: number | null;
  zone_id?: number | null;
  area_id?: number | null;
  contract_point_id?: number | null;
  maximum_capacity?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num?: number | null;
  update_date_num?: number | null;
  create_by?: number | null;
  update_by?: number | null;
  ref_id?: number | null;
  customer_type_id?: number | null;
}

export type NonTpaPointData = {
  id: number;
  non_tpa_point_name?: string | null;
}

export type QualityPlanningData = {
  gasday: string;
  unit: string;
  zone: {
    name: string;
    color: string;
    zone_master_quality: any[];
  };
  area: {
    name: string;
    color: string;
    entry_exit_id: number;
  };
  parameter: string;
  valueBtuScf?: number;
  monday?: {
    date: string;
    value: number;
  };
  tuesday?: {
    date: string;
    value: number;
  };
  wednesday?: {
    date: string;
    value: number;
  };
  thursday?: {
    date: string;
    value: number;
  };
  friday?: {
    date: string;
    value: number;
  };
  saturday?: {
    date: string;
    value: number;
  };
  sunday?: {
    date: string;
    value: number;
  };
} & {
  [key: `h${number}`]: string | undefined;
};

export type ZoneData = {
  id: number;
  name?: string;
  color?: string;
  create_date?: string | null;
  update_date?: string | null;
  create_date_num?: number | null;
  update_date_num?: number | null;
  create_by?: number | null;
  update_by?: number | null;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  entry_exit_id?: number | null;
  sensitive?: string | null;
}

export type ZoneMasterQuality = {
  id: number;
  name?: string | null;
  create_date?: string;
  update_date?: string;
  create_date_num?: number;
  update_date_num?: number;
  create_by?: number;
  update_by?: number;
  active?: boolean;
  zone_id?: number;
  v2_c2_plus_max?: number;
  v2_c2_plus_min?: number;
  v2_carbon_dioxide_max?: number;
  v2_carbon_dioxide_min?: number;
  v2_carbon_dioxide_nitrogen_max?: number;
  v2_carbon_dioxide_nitrogen_min?: number;
  v2_hydrocarbon_dew_max?: number;
  v2_hydrocarbon_dew_min?: number;
  v2_hydrogen_sulfide_max?: number;
  v2_hydrogen_sulfide_min?: number;
  v2_mercury_max?: number;
  v2_mercury_min?: number;
  v2_methane_max?: number;
  v2_methane_min?: number;
  v2_moisture_max?: number;
  v2_moisture_min?: number;
  v2_nitrogen_max?: number;
  v2_nitrogen_min?: number;
  v2_oxygen_max?: number;
  v2_oxygen_min?: number;
  v2_sat_heating_value_max?: number;
  v2_sat_heating_value_min?: number;
  v2_total_sulphur_max?: number;
  v2_total_sulphur_min?: number;
  v2_wobbe_index_max?: number;
  v2_wobbe_index_min?: number;
}

export type TabType = 'intraday' | 'daily' | 'weekly';
export type HourRange = '1-6 Hr.' | '7-12 Hr.' | '13-18 Hr.' | '19-24 Hr.' | 'All Day'; 