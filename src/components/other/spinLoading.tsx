import { Height } from "@mui/icons-material";
import Spinicon from "./spinIcon";

interface ComponentProps {
    spin: boolean,
    rounded?: number
    mode?: string
    fullWidth?: boolean
    fullHeight?: boolean
}

const Spinloading: React.FC<ComponentProps> = ({ spin = false, rounded = 0, mode = 'normal', fullWidth = false, fullHeight = false }) => {
    // return (
    //     mode == 'normal' ?
    //         <div className={`absolute w-full h-full flex justify-center items-center bg-[rgba(255,255,255)] bg-opacity-50 transition duration-300 ease-in-out ${spin == true ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} ${rounded != 0 && `rounded-[${rounded}px]`}`}>
    //             <Spinicon />
    //         </div>
    //     :
    //         <div className={`absolute w-[90%] h-[90%] mt-4 ml-4 flex justify-center items-center bg-[rgba(255,255,255)] bg-opacity-50 transition duration-300 ease-in-out 
    //             ${spin == true ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} 
    //             ${rounded != 0 && `rounded-[${rounded}px]`}`
    //         }>
    //             <Spinicon />
    //         </div>

    // )

    return (
        mode === 'normal' ? (
            <div
                className={`absolute w-full h-full flex justify-center items-center bg-[rgba(255,255,255)] bg-opacity-50 transition duration-300 ease-in-out 
                    ${spin ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} 
                    ${rounded != 0 && `rounded-[${rounded}px]`}`}
            >
                <Spinicon />
            </div>
        ) : mode === 'run tariff' ? (
            <div
                className={`absolute w-[90%] h-[90%] m-auto flex justify-center items-center bg-[rgba(255,255,255)] bg-opacity-40 transition duration-300 ease-in-out 
                    ${spin ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} 
                    ${rounded != 0 && `rounded-[${rounded}px]`}`}
            >
                <Spinicon />
            </div>
        ) : (
            <div
                className={`absolute w-[90%] h-[90%] mt-4 ml-4 flex justify-center items-center bg-[rgba(255,255,255)] bg-opacity-50 transition duration-300 ease-in-out 
                    ${spin ? 'z-[99] opacity-100' : 'z-[-1] opacity-0'} 
                    ${rounded != 0 && `rounded-[${rounded}px]`}`}
            >
                <Spinicon />
            </div>
        )

    )
}

export default Spinloading;