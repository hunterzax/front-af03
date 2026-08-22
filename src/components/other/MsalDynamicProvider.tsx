import React, { createContext, useEffect, useMemo, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// ====== Types ======
type MsalMap = Record<string, PublicClientApplication>;

type Ctx = {
    msalMap: MsalMap;
    activeClientId: string | null;
    setActiveClientId: (id: string) => void;
};

export const MsalDynamicContext = createContext<Ctx>({
    msalMap: {},
    activeClientId: null,
    setActiveClientId: () => { },
});

// ====== Component ======
export default function MsalDynamicProvider({
    children,
    tenantsState,
    createMsalConfig,
}: {
    children: React.ReactNode;
    tenantsState: any[];
    createMsalConfig: (tenant: any, app: any) => any;
}) {
    const [msalMap, setMsalMap] = useState<MsalMap>({});
    const [activeClientId, setActiveClientIdState] = useState<string | null>(null);

    // build instances map once tenants loaded
    useEffect(() => {
        if (!tenantsState?.length) return;

        const map: MsalMap = {};
        for (const tenant of tenantsState) {
            for (const app of tenant.apps || []) {
                const cfg = createMsalConfig(tenant, app);
                map[app.client_id] = new PublicClientApplication(cfg);
            }
        }

        setMsalMap(map);

        // pick active client id (priority: localStorage -> first b2c -> first app)
        const saved = localStorage.getItem("ACTIVE_MSAL_CLIENT_ID");
        if (saved && map[saved]) {
            setActiveClientIdState(saved);
            return;
        }

        const b2cApp = tenantsState
            .flatMap(t => t.apps || [])
            .find(a => (tenantsState.find(tt => tt.apps?.includes(a))?.b2c === "Y"));

        const defaultId = b2cApp?.client_id || Object.keys(map)[0] || null;
        if (defaultId) {
            localStorage.setItem("ACTIVE_MSAL_CLIENT_ID", defaultId);
            setActiveClientIdState(defaultId);
        }
    }, [tenantsState, createMsalConfig]);

    const setActiveClientId = (id: string) => {
        localStorage.setItem("ACTIVE_MSAL_CLIENT_ID", id);
        setActiveClientIdState(id);
    };

    const activeInstance = useMemo(() => {
        if (!activeClientId) return null;
        return msalMap[activeClientId] || null;
    }, [msalMap, activeClientId]);

    // กัน stub: ถ้ายังไม่มี instance อย่า render children ที่เรียก useMsal()
    if (!activeInstance) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading auth provider...
            </div>
        );
    }

    return (
        <MsalDynamicContext.Provider value={{ msalMap, activeClientId, setActiveClientId }}>
            <MsalProvider instance={activeInstance}>{children}</MsalProvider>
        </MsalDynamicContext.Provider>
    );
}