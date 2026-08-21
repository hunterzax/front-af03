const SSO_ENV = process.env.NEXT_PUBLIC_SSO_ENV;

const B2C_NAME = process.env.NEXT_PUBLIC_B2C_NAME;
const B2C_DOMAIN = `${B2C_NAME}.onmicrosoft.com`;
const B2C_URL = `https://${B2C_DOMAIN}`;
const B2C_KNOWN_AUTH = `https://${B2C_NAME}.b2clogin.com/`;
const B2C_TENENT = process.env.NEXT_PUBLIC_B2C_TENANT;
const B2C_CLIENT_ID = process.env.NEXT_PUBLIC_B2C_CLIENT_ID;
const B2C_DISPLAY_NAME = process.env.NEXT_PUBLIC_B2C_DISPLAY_NAME;
const B2C_SECRET = process.env.NEXT_PUBLIC_B2C_SECRET;
const B2C_SIGNIN_POLICY = process.env.NEXT_PUBLIC_B2C_SIGNIN_POLICY;
const B2C_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_B2C_CALLBACK_DOMAIN;
const B2C_SCOPE = SSO_ENV === "PRD" ? "common.read" : "cms.read";
const B2C_SCOPE2 = SSO_ENV === "PRD" ? "cms-web-api" : "web-api";
const changePasswordUrl = `${B2C_KNOWN_AUTH}${B2C_NAME}/oauth2/v2.0/authorize?p=B2C_1A_PASSWORDCHANGE&client_id=${B2C_CLIENT_ID}&nonce=defaultNonce&redirect_uri=${B2C_CALLBACK_DOMAIN}&scope=openid&response_type=id_token&prompt=login`;

const AD_NAME = process.env.NEXT_PUBLIC_AD_NAME;
const AD_DOMAIN = `${AD_NAME}.onmicrosoft.com`;
const AD_URL = `https://${AD_DOMAIN}`;
const AD_DISPLAY_NAME = process.env.NEXT_PUBLIC_AD_DISPLAY_NAME;
const AD_TENENT = process.env.NEXT_PUBLIC_AD_TENANT;
const AD_CLIENT_ID = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
const AD_SECRET = process.env.NEXT_PUBLIC_AD_SECRET;
const AD_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_AD_CALLBACK_DOMAIN;

const REDIRECT_URL = process.env.NEXT_PUBLIC_API_URL_LOGIN_PAGE;

const TENANTS = {
    tenants: [
        {
            tenant_id: `${B2C_TENENT}`,
            name: `${B2C_DOMAIN}`,
            domain: `${B2C_DOMAIN}`,
            b2c: "Y",
            env: `${SSO_ENV}`,
            apps: [
                {
                    isMsGraph: "Y",
                    app_display_name: `${B2C_DISPLAY_NAME}`,
                    app_description: "",
                    client_id: `${B2C_CLIENT_ID}`,
                    authority: [
                        {
                            type: "spa",
                            url: `${B2C_KNOWN_AUTH}${B2C_TENENT}/${B2C_SIGNIN_POLICY}/`,
                        },
                    ],
                    knownAuthorities: [`${B2C_KNOWN_AUTH}`],
                    userFlow: `${B2C_SIGNIN_POLICY}`,
                    callbackDomain: [`${B2C_CALLBACK_DOMAIN}`, `${REDIRECT_URL}`],
                    callbackType: ["spa"],
                    signedOutCallbackUrl: `${B2C_CALLBACK_DOMAIN}`,
                    loginRequest: {
                        scopes: ["openid"],
                    },
                    tokenRequest: {
                        scopes: [
                            `${B2C_URL}/${B2C_SCOPE2}/${B2C_SCOPE}`,
                        ],
                        forceRefresh: false,
                    },
                    scope: "https%3A%2F%2Fgraph.microsoft.com%2F.default",
                    client_secret: `${B2C_SECRET}`,
                    grant_type: "client_credentials",
                    bearer_strategy: {
                        credentials: {
                            tenantName: `${B2C_NAME}`,
                            clientID: `${B2C_CLIENT_ID}`,
                        },
                        policies: {
                            policyName: `${B2C_SIGNIN_POLICY}`,
                        },
                        resource: {
                            scope: [`${B2C_SCOPE}`],
                        },
                        metadata: {
                            authority: "login.microsoftonline.com",
                            discovery: ".well-known/openid-configuration",
                            version: "v2.0",
                        },
                        settings: {
                            isB2C: true,
                            validateIssuer: true,
                            passReqToCallback: false,
                            loggingLevel: "info",
                        },
                    },
                },
            ],
        },
        {
            tenant_id: `${AD_TENENT}`,
            name: `${AD_DOMAIN}`,
            domain: `${AD_DOMAIN}`,
            b2c: "N",
            env: `${SSO_ENV}`,
            apps: [
                {
                    isMsGraph: "Y",
                    app_display_name: `${AD_DISPLAY_NAME}`,
                    app_description: "",
                    client_id: `${AD_CLIENT_ID}`,
                    authority: [
                        {
                            type: "spa",
                            url: `https://login.microsoftonline.com/${AD_TENENT}/`,
                        },
                    ],
                    callbackDomain: [`${AD_CALLBACK_DOMAIN}`, `${REDIRECT_URL}`],
                    callbackType: ["spa"],
                    signedOutCallbackUrl: `${AD_CALLBACK_DOMAIN}`,
                    loginRequest: {
                        scopes: ["User.Read"],
                    },
                    client_secret: `${AD_SECRET}`,
                    grant_type: "client_credentials",
                    b2cScopes: [],
                    bearer_strategy: {},
                },
            ],
        },
    ],
};

// *** userFlow ***
// B2C_1_signin_without_mfa
// B2C_1_signin

export default {
    TENANTS,
    changePasswordUrl,
};