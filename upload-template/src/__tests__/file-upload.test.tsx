import { describe, it, expect, vi } from "vitest"
import { render, fireEvent, screen, waitFor } from "@testing-library/react"
import axios from "axios"
import App from "@/App"

window.matchMedia = vi.fn().mockImplementation(query => {
    return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }
})

vi.mock("axios")

describe("<App />", () => {
    it("renders the component", () => {
        render(<App />)
        expect(screen.getByText(/Add a file/i)).toBeInTheDocument()
    })
    it("handles file upload", async () => {
        const file = new File(["(⌐□□)"], "chill.png", { type: "image/png" })
        render(<App />)
        const input = screen.getByLabelText(/Add a file/i)

        vi.spyOn(axios, "post").mockResolvedValueOnce({ status: 200 })

        fireEvent.change(input, { target: { files: [file] } })
        const submitButton = await screen.findByRole("button", {
            name: /upload/i,
        })
        fireEvent.click(submitButton)
        // Fix this test to wait for axios post to be called and finished before checking for the success message
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1) // Wait for axios post to finish
            expect(
                screen.getByText(/chill.png uploaded successfully!/i),
            ).toBeInTheDocument()
        })
    })
    it("handles file upload failure", async () => {
        const file = new File(["(⌐□□)"], "fail.png", { type: "image/png" })
        render(<App />)
        const input = screen.getByLabelText(/Add a file/i)

        vi.spyOn(axios, "post").mockRejectedValueOnce(
            new Error("Upload failed"),
        )

        fireEvent.change(input, { target: { files: [file] } })
        const submitButton = await screen.findByRole("button", {
            name: /upload/i,
        })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1)
            expect(
                screen.getByText(/Failed to upload fail.png/i),
            ).toBeInTheDocument()
        })
    })
    it("displays file preview on selection", async () => {
        render(<App />)
        const input = screen.getByLabelText(/Add a file/i)
        const file = new File(["(⌐□□)"], "preview.png", { type: "image/png" })

        fireEvent.change(input, { target: { files: [file] } })

        await waitFor(async () => {
            const previewElements = await screen.findAllByText(/preview.png/i)

            // Expect that at least one element with the specified text is present
            expect(previewElements.length).toBeGreaterThan(0)
            expect(previewElements[0]).toBeInTheDocument()
        })
    })
    it("handles drag and drop file upload", async () => {
        render(<App />)
        const dropArea = document.querySelector("#drop-area") as HTMLElement
        const file = new File(["content"], "dragdrop.png", {
            type: "image/png",
        })

        fireEvent.drop(dropArea, { dataTransfer: { files: [file] } })

        await waitFor(() => {
            expect(screen.getByText(/7.00 Bytes/i)).toBeInTheDocument()
        })
    })
    it("allows file deletion", async () => {
        render(<App />)
        const input = screen.getByLabelText(/Add a file/i)
        const file = new File(["(⌐□□)"], "delete.png", { type: "image/png" })

        fireEvent.change(input, { target: { files: [file] } })
        await waitFor(async () => {
            const previewElements = await screen.findAllByText(/delete.png/i)

            // Expect that at least one element with the specified text is present
            expect(previewElements.length).toBeGreaterThan(0)
            expect(previewElements[0]).toBeInTheDocument()
        })

        const deleteButton = document.querySelector(
            "#remove-button",
        ) as HTMLElement

        console.log(deleteButton)
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(screen.queryByText(/delete.png/i)).not.toBeInTheDocument()
        })
    })
})
