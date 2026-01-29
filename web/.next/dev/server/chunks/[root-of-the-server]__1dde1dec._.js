module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Downloads/private-project/Preptime-private/web/pages/api/auth/[...nextauth].ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth__$5b$external$5d$__$28$next$2d$auth$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__ = __turbopack_context__.i("[externals]/next-auth [external] (next-auth, cjs, [project]/Downloads/private-project/Preptime-private/web/node_modules/next-auth)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth$2f$providers$2f$google__$5b$external$5d$__$28$next$2d$auth$2f$providers$2f$google$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__ = __turbopack_context__.i("[externals]/next-auth/providers/google [external] (next-auth/providers/google, cjs, [project]/Downloads/private-project/Preptime-private/web/node_modules/next-auth)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth$2f$providers$2f$azure$2d$ad__$5b$external$5d$__$28$next$2d$auth$2f$providers$2f$azure$2d$ad$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__ = __turbopack_context__.i("[externals]/next-auth/providers/azure-ad [external] (next-auth/providers/azure-ad, cjs, [project]/Downloads/private-project/Preptime-private/web/node_modules/next-auth)");
;
;
;
const authOptions = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth$2f$providers$2f$google__$5b$external$5d$__$28$next$2d$auth$2f$providers$2f$google$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__["default"])({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/calendar.readonly openid email profile"
                }
            }
        }),
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth$2f$providers$2f$azure$2d$ad__$5b$external$5d$__$28$next$2d$auth$2f$providers$2f$azure$2d$ad$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__["default"])({
            clientId: process.env.AZURE_AD_CLIENT_ID || "",
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
            tenantId: process.env.AZURE_AD_TENANT_ID || "common",
            authorization: {
                params: {
                    scope: "offline_access openid profile email User.Read Calendars.Read"
                }
            }
        })
    ],
    callbacks: {
        async jwt ({ token, account }) {
            // Persist the access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
        async session ({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken;
            session.provider = token.provider;
            return session;
        }
    },
    pages: {
        signIn: '/login'
    }
};
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$next$2d$auth__$5b$external$5d$__$28$next$2d$auth$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$next$2d$auth$29$__["default"])(authOptions);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1dde1dec._.js.map