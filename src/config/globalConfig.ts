import { grey } from "@mui/material/colors";

const GLOBALCONFIGKEY = {
    PREFIX: "@ETC",
};

const UTILITIES = {
    LOGIN_TYPE_B2C: "B2C",
    LOGIN_TYPE_AAD: "AAD",
    APP_TYPE: "ETC",
    ERRORS: {
        NULL_MENU:
            "You don’t have permission to access this site. Please contact admin to grant permission.",
    },
    LABEL_TABLE_BTN: {
        SELECT_ROLE: "เลือกบทบาทในการใช้งาน",
        ROLE_TILE_EN: "Role",
        CANCEL: "ยกเลิก",
    },
};

const mockTemplate = [
    {
        fontSize: "0.9rem",
        drawerWidth: 260,
        id: "1",
        background: "images/cms-bg1.png",
        mdTheme: {
            components: {
                MuiInputBase: {
                    styleOverrides: {
                        root: {
                            boxShadow:
                                "2px 2px 5px 0px rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.05)",
                            borderRadius: "4px",
                            "&.Mui-disabled": {
                                background: grey[300],
                                boxShadow:
                                    "inset 2px 2px 5px 0px rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.05)",
                            },
                            ".Mui-disabled": {
                                "-webkit-text-fill-color": "rgba(0, 0, 0, 1) !important",
                            },
                            input: {
                                padding: "4px 8px",
                            },
                            ".MuiSelect-select": {
                                padding: "4px 8px",
                            },
                        },
                    },
                },
                MuiAutocomplete: {
                    styleOverrides: {
                        root: {
                            "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
                                paddingTop: "1.5px",
                                paddingBottom: "1.5px",
                            },
                        },
                    },
                },
                MuiList: {
                    styleOverrides: {
                        root: {
                            "::-webkit-scrollbar": {
                                display: "none",
                            },
                        },
                    },
                },
                MuiInputLabel: {
                    styleOverrides: {
                        root: {
                            color: "#000000",
                            fontSize: "0.9rem",
                        },
                    },
                },
                MuiDataGrid: {
                    styleOverrides: {
                        root: {
                            fontSize: "0.9rem",
                        },
                    },
                },
                MuiTable: {
                    styleOverrides: {
                        root: {
                            fontSize: "0.9rem",
                        },
                    },
                },
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            fontSize: "0.9rem",
                        },
                    },
                },
                MuiStack: {
                    styleOverrides: {
                        root: {
                            p: { fontSize: "0.9rem" },
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: { fontSize: "0.9rem", padding: "2.9px 10px" },
                    },
                },
                MuiListItemText: {
                    styleOverrides: {
                        root: {
                            span: {
                                fontSize: "0.9rem !important",
                            },
                        },
                    },
                },
            },
            typography: {
                fontFamily: "Kanit",
                fontWeightRegular: 500,
            },
            palette: {
                primary: {
                    main: "#237CB3",
                    contrastText: "#fff",
                    grey: "#616161",
                },
                secondary: {
                    main: "#757575",
                    contrastText: "#fff",
                    grey: "#616161",
                    light: "#eeeeee",
                },
                success: {
                    main: "#4caf50",
                    contrastText: "#fff",
                    light: "#d9f9e6",
                },
                info: {
                    main: "#03A8E5",
                    contrastText: "#fff",
                    grey: "#616161",
                    light: "#94DFFE",
                },
                white: {
                    main: "#fff",
                    contrastText: "#000",
                    grey: "#616161",
                },
                black: {
                    main: "#000",
                    contrastText: "#fff",
                },
                warning: {
                    main: "#f57f17",
                },
                danger: {
                    main: "#d50000",
                },
            },
        },
    },
];

export default {
    GLOBALCONFIGKEY,
    mockTemplate,
    UTILITIES,
};
