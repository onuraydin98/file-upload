import { describe, it, expect } from "vitest"
import calcFileSize from "@/utils/file-size"

describe("calcFileSize", () => {
    it("returns 'false' for bytes greater than or equal to the 50 MB threshold", () => {
        const result = calcFileSize(51000000)
        expect(result).toBe("false")
    })

    it("returns '0 Bytes' for zero bytes", () => {
        const result = calcFileSize(0)
        expect(result).toBe("0 Bytes")
    })

    it("calculates file size in Bytes", () => {
        const result = calcFileSize(512)
        expect(result).toBe("512.00 Bytes")
    })

    it("calculates file size in KB", () => {
        const result = calcFileSize(1024 * 2)
        expect(result).toBe("2.00 KB")
    })

    it("calculates file size in MB", () => {
        const result = calcFileSize(1024 * 1024 * 3)
        expect(result).toBe("3.00 MB")
    })
})
