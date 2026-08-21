import { Height } from "@mui/icons-material";
import Spinicon from "./spinIcon";

interface ComponentProps {
    spin: boolean,
    rounded?: number
}

const Spinloading2: React.FC<ComponentProps> = ({ spin = false, rounded = 0 }) => {
    return (
        <div
            className={`
                absolute inset-0 flex justify-center items-center 
                bg-[rgba(255,255,255,0.5)] transition duration-300 ease-in-out 
                ${spin ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} 
                ${rounded ? `rounded-[${rounded}px]` : ''}
            `}
        >
            <Spinicon />
        </div>
    )
}

export default Spinloading2;