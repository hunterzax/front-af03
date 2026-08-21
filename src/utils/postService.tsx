// "use client";
import axios from "axios";
import getCookieValue from "./getCookieValue";
import { decryptData, decryptResponse } from "./encryptionData";
const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_URL2 = process.env.API_URL
const IS_ENCRYPT = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_MODE

export const getNoTokenService = async (url: string) => {
    try {
        let res
        const baseURL = API_URL2 || API_URL;

        if (!baseURL) {
            throw new Error('API URLs are not defined in the environment variables.');
        }

        await axios.get(`${baseURL}${url}`, { timeout: 600000 }).then((response) => {
            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response.data);
                res = decryptedData
            } else {
                res = response.data
            }

            // const decryptedData = decryptResponse(response.data);
            // res = response.data
            // res = decryptedData
        })
        // .catch((error) => {
        //     return error;
        // });
        return res;

    } catch (error:any) {
        // throw error;

         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const getService = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        await axios.get(`${API_URL}${url}`, {
            // headers: { Authorization: `Bearer ${auth_token}` },
            // headers: { Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}` },
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {

            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response.data);
                res = decryptedData
            } else {
                res = response.data
            }

            // const decryptedData = decryptResponse(response.data);
            // res = decryptedData;
            // res = response.data

        })
        // .catch((error) => {
        //     res = error
        //     return error;
        // });
        return res;
    } catch (error:any) {
        // throw error;

         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

// buffer ห้าม decode ทุกกรณี
export const getServiceArrayBuffer = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;
        const res = await axios.get(`${API_URL}${url}`, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000,
            responseType: 'arraybuffer'
        });

        let res_;
        if (IS_ENCRYPT == 'true') {
            // const decryptedData = decryptResponse(res);
            // res_ = decryptedData
            res_ = res
        } else {
            res_ = res
        }
        return res_;
    } catch (error:any) {
        // Fetch error
        // throw error;
         if (IS_ENCRYPT == 'true' && error?.response) {
            // const decryptedData = decryptResponse(error?.response?.data);
            // return decryptedData
            return error?.response?.data
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const deleteService = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        await axios.delete(`${API_URL}${url}`, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {

            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response.data);
                res = decryptedData
            } else {
                res = response.data
            }

            // const decryptedData = decryptResponse(response.data);
            // res = decryptedData;
            // res = response.data
        })
        // .catch((error) => {
        //     res = error
        //     return error;
        // });
        return res;

    } catch (error:any) {
        // throw error;
         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const deleteServiceWithPayload = async (url: string, payload: {} = {}) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;
        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const response = await axios.delete(`${API_URL}${url}`, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            data: payload,
            timeout: 600000
        });
        // const decryptedData = decryptResponse(response.data);
        // return decryptedData;

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response.data);
            return decryptedData
        } else {
            return response.data
        }

        // return response.data;
    } catch (error:any) {
        // return error;


        if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const getServiceLimitOffset = async (url: string) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let res: any
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        await axios.get(`${API_URL}${url}`, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        }).then((response) => {
            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response.data);
                res = decryptedData
            } else {
                res = response.data
            }

            // const decryptedData = decryptResponse(response.data);
            // res = decryptedData;
            // res = response.data
        }).catch((error) => {
            res = error
            return error;
        });
        return res;
    } catch (error) {
        throw error;
    }
};

export const downloadService = async (url: string, type?: any, fileName?: string) => {
    try {
        // type 4 = SHORT_NON_FIRM
        // type 3 = SHORT_FIRM
        // type 2 = MEDIUM
        // type 1 = LONG
        const date = new Date();
        const yyyymmddhhmmss = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
        let typeString: any = '';

        switch (type) {
            case 1:
                typeString = 'LONG';
                break;
            case 2:
                typeString = 'MEDIUM';
                break;
            case 3:
                typeString = 'SHORT_FIRM';
                break;
            case 4:
                typeString = 'SHORT_NON_FIRM';
                break;
            default:
                typeString = '';
                break;
        }

        let filename = fileName || `${yyyymmddhhmmss}_${typeString}.xlsx`;

        if (type == 'bal-vent-commissioning') {
            filename = `Vent_comissioning_othergas_${yyyymmddhhmmss}.xlsx`
        }

        let tokenFromLcstr: any = localStorage.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr;

        // ส่งคำขอด้วย response type เป็น 'blob'
        let response: any
        let res_: any
        try {
            response = await axios.get(`${API_URL}${url}`, {
                // headers: { Authorization: `Bearer ${auth_token}` },
                // headers: { Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}` },
                headers: {
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
                responseType: 'blob',
                timeout: 600000
            });

            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response);
                res_ = decryptedData
            } else {
                res_ = response
            }

            // สร้าง blob จากข้อมูลใน response
            // const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const blob = new Blob([res_.data], { type: res_.headers['content-type'] });

            // สร้างลิงก์
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);

            // พยายามดึงชื่อไฟล์จาก Content-Disposition header
            // const contentDisposition = response.headers['content-disposition'];
            const contentDisposition = res_.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, ''); // ลบเครื่องหมายคำพูดถ้ามี
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            return { "status": 400, "error": typeString == '' ? "Something went wrong." : "The selected time is outside the allowed booking period." }
        }

    } catch (error) {
        // Error during file download
        throw error;
    }
};

export const postService = async (url: string, payload?: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // return await axios.post(`${API_URL}${url}`, payload, {
        //     headers: {
        //         Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
        //     },
        //     timeout: 600000
        // }).then((response) => {

        //     if (IS_ENCRYPT == 'true') {
        //         const decryptedData = decryptResponse(response.data);
        //         return decryptedData
        //     } else {
        //         return response.data
        //     }

        //     // const decryptedData = decryptResponse(response.data);
        //     // return decryptedData;
        //     // return response.data;
        // }).catch((error) => {
        //     return error;
        // });

        const res = await axios.post(`${API_URL}${url}`, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        })

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(res.data);
            return decryptedData
        } else {
            return res.data
        }

    } catch (error: any) {
        // อยากเห็นให้ log พวกนี้ 
        // error
        // error?.response
        // error?.response?.data

        if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
        // throw error;
    }
};

export const postServiceNoAuth = async (url: string, payload: any) => {
    try {
        return await axios.post(`${API_URL}${url}`, payload, { timeout: 600000 }).then((response) => {
            // const decryptedData = decryptResponse(response.data);
            // return decryptedData;

            if (IS_ENCRYPT == 'true') {
                const decryptedData = decryptResponse(response.data);
                return decryptedData
            } else {
                return response.data
            }

            // return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error:any) {
        // throw error;
         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const postServiceNoAuthNo = async (url: string, payload: any) => {
    try {
        return await axios.post(`${API_URL}${url}`, payload, { timeout: 600000 }).then((response) => {
           
            return response.data

            // return response.data;
        }).catch((error) => {
            return error;
        });
    } catch (error) {
        throw error;
        
    }
};

export const patchService = async (url: string, payload?: {}, timeout = 600000) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // return await axios.patch(`${API_URL}${url}`, payload, {
        //     headers: {
        //         Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
        //     },
        //     timeout: timeout
        // }).then((response) => {

        //     if (IS_ENCRYPT == 'true') {
        //         const decryptedData = decryptResponse(response.data);
        //         return decryptedData
        //     } else {
        //         return response.data
        //     }

        //     // const decryptedData = decryptResponse(response.data);
        //     // return decryptedData;
        //     // return response.data;
        // }).catch((error) => {
        //     return error;
        // });

        const res = await axios.patch(`${API_URL}${url}`, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: timeout
        })

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(res.data);
            return decryptedData
        } else {
            return res.data
        }

    } catch (error: any) {
        if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            return error?.response
            // return error
        }
        // throw error;
    }
};

export const patchServiceDownload = async (
    url: string,
    payload: {} = {},
    timeout = 600000,
    responseType: any = 'json' // default is 'json', but can be 'blob'
) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const response = await axios.patch(`${API_URL}${url}`, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null,
            },
            timeout: timeout,
            responseType: responseType
        });

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response);
            return decryptedData
        } else {
            return response
        }

        // return response;
    } catch (error:any) {
        // throw error;
         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            return error?.response
            // return error
        }
    }
};

export const uploadFileServiceWithAuth = async (url: string, file: File, id?: any, key?: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const formData = new FormData();
        formData.append('file', file);

        if (id && key) {
            formData.append(`${key}`, id);
        }

        const response: any = await axios.post(`${API_URL}${url}`, formData, {
            headers: {
                "content-type": "multipart/form-data",
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            // timeout: 10000000
            timeout: 0 // ไม่จำกัดเวลา
        })

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response?.data);
            return {
                ...response,
                data: decryptedData
            }
        } else {
            return response
        }

        // return response
    } catch (error:any) {
        // return error
         if (IS_ENCRYPT == 'true' && error?.response) {
            // const decryptedData = decryptResponse(error?.response);
            // return decryptedData

            // const decryptedData = decryptResponse(error?.response?.data);
            // return {
            //     ...error?.response,
            //     data: decryptedData
            // }
            
            const decryptedData = decryptResponse(error?.response?.data);
            return {
                ...error,
                response: {
                    data: decryptedData,
                    ...error?.response
                },
            }
        } else {
            // return error?.response
            return error
        }
    }
};

export const uploadFileServiceWithAuth2 = async (
    url: string,
    file: File,
    dynamicFields: Record<string, any> = {}
) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const formData = new FormData();
        formData.append("file", file);

        // Append dynamic fields to the form data
        Object.entries(dynamicFields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const response: any = await axios
            .post(`${API_URL}${url}`, formData, {
                // headers: {
                //     "content-type": "multipart/form-data",
                //     // Authorization: `Bearer ${auth_token}`,
                //     Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}`
                // },
                headers: {
                    "content-type": "multipart/form-data",
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
            })
            // .then((response) => {
            //     return response.data;
            // })
            // .catch((error) => {
            //     return error;
            // });

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response.data);
            return decryptedData
        } else {
            return response.data
        }

        // return response;
    } catch (error:any) {
        // Upload failed
      
         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const uploadFileServiceWithAuth2UploadTemplateForShipper = async (
    url: string,
    // file?: File,
    file?: any,
    dynamicFields: Record<string, any> = {}
) => {

    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const formData = new FormData();
        if (file) {
            formData.append("file", file);
        }

        // Append dynamic fields to the form data
        Object.entries(dynamicFields).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const response: any = await axios
            .post(`${API_URL}${url}`, formData, {
                // headers: {
                //     "content-type": "multipart/form-data",
                //     // Authorization: `Bearer ${auth_token}`,
                //     Authorization: `Bearer ${auth_token.replace(/^"|"$/g, "")}`
                // },
                headers: {
                    "content-type": "multipart/form-data",
                    Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
                },
            })
            .then((response) => {
                // const decryptedData = decryptResponse(response.data);
                // return decryptedData;
                return response.data;
            })
            // .catch((error) => {
            //     return error;
            // });

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response);
            return decryptedData
        } else {
            return response
        }

        // return response;
    } catch (error:any) {
        // throw error;
         if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
    }
};

export const uploadFileService = async (url: string, file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // const response: any = await axios.post(`http://localhost:4006/uploadfile/`, formData, { // test
        const response: any = await axios.post(`${API_URL}${url}`, formData, {
            headers: { "content-type": "multipart/form-data" },
            timeout: 600000
        }).then((response) => {
            // const decryptedData = decryptResponse(response.data);
            // return decryptedData;
            return response.data;
        }).catch((error) => {
            return error;
        });

        // เส้นนี้ไม่ต้อง decrypt
        // if (IS_ENCRYPT == 'true') {
        //     const decryptedData = decryptResponse(response);
        //     return decryptedData
        // } else {
        //     return response
        // }

        return response
    } catch (error) {
        throw error;
    }
};

export const importTemplateService = async (url: string, file: File, terminate_date?: any, amd?: any) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('text', terminate_date);
        formData.append('text', amd);

        const response: any = await axios.post(`${API_URL}${url}`, formData, {
            headers: { "content-type": "multipart/form-data" },
            timeout: 600000
        }).then((response) => {
            // const decryptedData = decryptResponse(response.data);
            // return decryptedData;
            return response.data;
        }).catch((error) => {
            return error;
        });

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(response);
            return decryptedData
        } else {
            return response
        }

        // return response
    } catch (error) {
        throw error;
    }
};

export const putService = async (url: string, payload: any) => {
    try {
        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        // return await axios.put(`${API_URL}${url}`, payload, {
        //     headers: {
        //         Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
        //     },
        //     timeout: 600000
        // }).then((response) => {

        //     if (IS_ENCRYPT == 'true') {
        //         const decryptedData = decryptResponse(response.data);
        //         return decryptedData
        //     } else {
        //         return response.data
        //     }

        //     // const decryptedData = decryptResponse(response.data);
        //     // return decryptedData;
        //     // return response.data;
        // }).catch((error) => {
        //     return error;
        // });

        const res = await axios.put(`${API_URL}${url}`, payload, {
            headers: {
                Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            },
            timeout: 600000
        })

        if (IS_ENCRYPT == 'true') {
            const decryptedData = decryptResponse(res.data);
            return decryptedData
        } else {
            return res.data
        }
    } catch (error: any) {
        if (IS_ENCRYPT == 'true' && error?.response) {
            const decryptedData = decryptResponse(error?.response?.data);
            return decryptedData
        } else {
            // return error?.response?.data
            return error
        }
        // throw error;
    }
};