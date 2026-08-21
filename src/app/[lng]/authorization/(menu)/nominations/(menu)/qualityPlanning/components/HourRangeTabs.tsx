import { HourRange } from '@/app/types';
import { Tabs, Tab } from '@mui/material';

interface HourRangeTabsProps {
  subTabIndex: number;
  onSubTabChange: (newValue: number) => void;
}

export function HourRangeTabs({
  subTabIndex,
  onSubTabChange,
}: HourRangeTabsProps) {
  // const hourRanges: HourRange[] = ['1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.', 'All Day'];
  const hourRanges: HourRange[] = ['All Day', '1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.']; // Tab Intraday and Tab Daily : ย้ายแถบ All day มาอยู่แถบแรก และ Default แสดงแถบนี้ไว้ https://app.clickup.com/t/86etzcgyw

  return (
    <Tabs
      value={subTabIndex}
      onChange={(_, newValue) => onSubTabChange(newValue)}
      sx={{
        '& .Mui-selected': {
          color: '#00ADEF !important',
          fontWeight: 'bold !important',
        },
        '& .MuiTabs-indicator': {
          backgroundColor: '#00ADEF !important',
          width: '59px !important',
          transform: 'translateX(30%)',
          bottom: '8px',
        },
        '& .MuiTab-root': {
          minWidth: 'auto !important',
        },
      }}
    >
      {hourRanges.map((label, index) => (
        <Tab
          key={label}
          label={label}
          sx={{
            fontFamily: 'Tahoma !important',
            textTransform: 'none',
            padding: '8px 16px',
            minWidth: '35px',
            maxWidth: '103px',
            flexShrink: 0,
            color: subTabIndex === index ? '#58585A' : '#9CA3AF',
          }}
        />
      ))}
    </Tabs>
  );
} 