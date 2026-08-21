import React, { useState, useEffect, useRef } from 'react';
import { Refresh, Search, Replay } from "@mui/icons-material";
import { Button } from '@mui/material';
import "./styles.css"
interface CaptchaProps {
    setIsVerify?: any;
    xyz?: any;
    setXyz?: any;
    isSubmit?: any;
    hardResetCaptcha?: any;
    setHardResetCaptcha?: any;
}

const AlphabetCaptcha: React.FC<CaptchaProps> = ({ setIsVerify, isSubmit, xyz, setXyz, hardResetCaptcha, setHardResetCaptcha }) => {
    const [captchaLetter, setCaptchaLetter] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const canvasRef = useRef(null);
    const original_k = "flex items-center justify-center  h-[30px] w-[30px] border-[#00ADEF] text-[#00ADEF] mt-auto"
    const inputClass = "text-[12px] block w-full p-2 ps-5 pe-10 h-[50px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] text-black"

    // Function to generate a random alphabet letter
    const generateRandomLetter = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        return Array.from({ length: 5 })
            .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
            .join('');
    };

    const drawCaptcha = () => {
        const letter = generateRandomLetter();
        setCaptchaLetter(letter);
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear the canvas for a new letter
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw random shapes and lines in the background
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 20 + 10,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        for (let i = 0; i < 50; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`; // เดิมใช้ ocpacity 0.3
            ctx.lineWidth = Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Set random styles for CAPTCHA letter
        ctx.font = '36px Tahoma';
        ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw the CAPTCHA letter in the center
        ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
    };

    useEffect(() => {
        drawCaptcha();
        if (isSubmit) {
            handleRefreshCaptcha()
        }
    }, []);

    useEffect(() => {
        if (isSubmit) {
            handleRefreshCaptcha()
        }
    }, [isSubmit]);

    const handleChange = (e: any) => {
        setUserInput(e.target.value.toUpperCase());
        setIsVerified(e.target.value.toUpperCase() === captchaLetter);
        // setIsVerify(e.target.value.toUpperCase() === captchaLetter); // เทียบว่า text captcha กะที่พิมพ์มาตรงกันมั้ย
        setIsVerify(true); // ถ้าพิมพ์มาต่อให้ไม่ตรงกับ captcha ที่แสดง ก็เป็น true เลย เนื่องจากข้อนี้ ---> v1.0.90 ใส่ captcha ผิดควร สามารถ กด login ได้แล้ว refresh captcha อย่างเดียว https://app.clickup.com/t/86ernzz11
        // setXyz(e.target.value.toUpperCase()?.length == 5 ? true : false)
        // setXyz(e.target.value.toUpperCase() !== captchaLetter)

        if(e.target.value.toUpperCase() !== captchaLetter){
            setXyz(true)
        }else{
            setXyz(false)
        }
        // setXyz(e.target.value.toUpperCase() !== captchaLetter ? true : false)
    };

    const handleRefreshCaptcha = () => {
        setUserInput('');
        setIsVerified(false);
        setIsVerify(false);
        drawCaptcha();
        // setXyz(false)
    };

    useEffect(() => {
        if (userInput?.length <= 0) {
            setIsVerify(false);
        }
    }, [userInput])

    useEffect(() => {
      if(hardResetCaptcha){
        handleRefreshCaptcha();
        setHardResetCaptcha(false);
      }
    }, [hardResetCaptcha])

    return (
        <div className='capcha-layout'>
            <div style={{ display: "grid", gridTemplateColumns: "80% 20%" }}>
                <div className='capcha-panel'>
                    <canvas
                        className='capcha-item'
                        ref={canvasRef}
                        width={170}
                        height={48}
                    />
                </div>

                {/* <div>{captchaLetter}</div> */}

                <div className='flex justify-end pr-[4px]'>
                    <Button
                        variant="outlined"
                        className={`${original_k}`}
                        onClick={handleRefreshCaptcha}
                        style={{ width: '30px', height: '30px', minWidth: '30px', minHeight: '30px', padding: '0', color: '#00ADEF', borderColor: '#00ADEF' }} // Added styles for width and height
                    >
                        <Replay style={{ fontSize: "18px" }} />
                    </Button>
                </div>
            </div>

            <div className='padding-input'>
                <input
                    type="text"
                    value={userInput}
                    onChange={handleChange}
                    maxLength={5}
                    className={`${inputClass} ${!isVerified && userInput !== '' && '!border-[#F44336]'} `}
                    
                    // className={`${inputClass} ${xyz && userInput !== '' && '!border-[#F44336]'} `}
                    // style={{ textTransform: 'uppercase' }}
                    placeholder="Enter the characters"
                />
            </div>
        </div>
    );
};

export default AlphabetCaptcha;