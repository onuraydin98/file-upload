import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: { port: 3000 },
    plugins: [react()],
    test: {
        globals: true,
        setupFiles: ["./src/__tests__/setupFile.ts"],
        environment: "jsdom",
    },
})
