import { describe, it, expect, vi } from "vitest"
import processFile from "@/utils/process-file"

describe("processFile", () => {
    it("processes a file successfully", () => {
        const mockOnChange = vi.fn()
        const file = new File(["content"], "test.txt", { type: "text/plain" })

        // eslint-disable-next-line @typescript-eslint/ban-types
        let loadHandler: Function | null = null

        const mockReader: Partial<FileReader> & {
            onload?: (event: unknown) => void
        } = {
            readAsDataURL: vi.fn(),
            onload: vi.fn(),
        }

        mockReader.onload = event => {
            loadHandler && loadHandler(event)
        }

        vi.spyOn(global, "FileReader").mockImplementation(
            () => mockReader as FileReader,
        )

        processFile(file, mockOnChange, "1234")

        expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file)

        // Manually trigger the onload handler
        loadHandler = mockReader.onload
        loadHandler(new Event("load"))

        expect(mockOnChange).toHaveBeenCalled()
    })
})
