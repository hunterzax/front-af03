import { Tooltip } from "@mui/material";
import { styled } from '@mui/material/styles';

export const CustomTooltip = styled(({ className, ...props }:any) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .MuiTooltip-tooltip`]: {
        backgroundColor: '#ffffff',
        color: '#000', 
        border: '1px solid #C5C5C5',
        fontSize: '0.875rem',
        padding: '8px',
        borderRadius: '4px',
        maxWidth: '1200px',
        width: 'auto',

    },
    [`& .MuiTooltip-arrow`]: {
        color: '#ffffff', // Arrow background color
        '&::before': {
            content: '""',
            position: 'absolute',
            border: '1px solid #C5C5C5', // Arrow border color
            width: '100%',
            height: '100%',
            borderRadius: '2px',
        },
    },
});
