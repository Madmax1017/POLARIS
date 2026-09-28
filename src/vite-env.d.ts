/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    // Add other env vars here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
