import { TabType } from '@/app/types';
import { Tabs, Tab } from '@mui/material';

interface QualityPlanningTabsProps {
  tabIndex: number;
  onTabChange: (newValue: number) => void;
}

export function QualityPlanningTabs({
  tabIndex,
  onTabChange,
}: QualityPlanningTabsProps) {
  const tabs: TabType[] = ['intraday', 'daily', 'weekly'];

  return (
    <Tabs
      value={tabIndex}
      onChange={(_, newValue) => onTabChange(newValue)}
      sx={{
        marginBottom: "-19px !important",
        "& .MuiTabs-indicator": {
            display: "none", // Remove the underline
        },
        "& .Mui-selected": {
            color: "#58585A !important",
        },
      }}
    >
      {tabs.map((label, index) => (
        <Tab
          key={label}
          label={label.charAt(0).toUpperCase() + label.slice(1)}
          sx={{
            fontFamily: 'Tahoma',
            border: '0.5px solid',
            borderColor: '#DFE4EA',
            borderBottom: 'none',
            borderTopLeftRadius: '9px',
            borderTopRightRadius: '9px',
            textTransform: 'none',
            padding: '8px 16px',
            backgroundColor: tabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
            color: tabIndex === index ? '#58585A' : '#9CA3AF',
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
          }}
        />
      ))}
    </Tabs>
  );
} 