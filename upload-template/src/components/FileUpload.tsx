import { useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import toast from "react-hot-toast"
import calcFileSize from "@/utils/file-size"
import cn from "@/utils/cn"
import Item from "@/components/Item"

export type TFile = {
    id: string
    fileName: string
    fileType: string
    fileImage: string | null
    dateTime: string
    fileSize: string
    uploadProgress?: number
}

const processFile = (
    file: File,
    onChange: React.Dispatch<React.SetStateAction<TFile[]>>,
) => {
    const reader = new FileReader()
    const { name, type, lastModified, size } = file
    const fileId = uuid().slice(0, 8)

    console.log("image", reader.result)

    reader.onloadstart = e => {
        console.log("load start", file.name, e)
        onChange(prev => [
            ...prev,
            {
                id: fileId,
                fileName: name,
                fileType: type,
                fileImage: "",
                dateTime: new Date(lastModified).toLocaleString("tr-TR"),
                fileSize: calcFileSize(size),
                uploadProgress: 0, // Initialize uploadProgress to 0
            },
        ])
    }

    reader.onprogress = event => {
        if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            // Update the state to track progress
            onChange(prev =>
                prev.map(prevFile =>
                    prevFile.id === fileId
                        ? { ...prevFile, uploadProgress: progress }
                        : prevFile,
                ),
            )
        }
    }

    reader.onloadend = () => {
        // Set uploadProgress to 100 when the file is fully loaded
        onChange(prev =>
            prev.map(prevFile =>
                prevFile.id === fileId
                    ? {
                          ...prevFile,
                          uploadProgress: 100,
                          fileImage: reader.result as string,
                      }
                    : prevFile,
            ),
        )
        // You can add additional logic here after the file is loaded
        console.log("load ended", file.name)
    }

    // reader.onload = () => {
    //     onChange(prev => [
    //         ...prev,
    //         {
    //             id: fileId,
    //             fileName: name,
    //             fileType: type,
    //             fileImage: reader.result as string,
    //             dateTime: new Date(lastModified).toLocaleString("tr-TR"),
    //             fileSize: calcFileSize(size),
    //         },
    //     ])
    // }

    // reader.onerror = error => {
    //     console.error("Error reading file:", error)
    // }

    // reader.onloadstart = () => console.log("load started", file.name)
    // reader.onloadend = () => {}

    if (calcFileSize(file.size) === "false") {
        return toast.error(`${file.name} is bigger than 50MB`, {
            position: "bottom-right",
            // style: { backgroundColor: "red" },
        })
    }

    reader.readAsDataURL(file)
}

export const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState<TFile[]>([])
    const dropAreaRef = useRef<HTMLDivElement | null>(null)

    console.log("render")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = (e: any) => {
        e.preventDefault()

        console.log("e", e)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("input render change")
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
                if (!file) return
                processFile(file, setSelectedFiles)
            })
        }
    }

    const handleDeleteSelectedFile = (id: string) => {
        // TODO: Change below
        if (window.confirm("Are you sure you want to delete this Image?")) {
            const result = selectedFiles.filter(data => data.id !== id)
            setSelectedFiles(result)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        // Add styles for a better visual indication
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.add("dragover")
        }
    }

    const handleDragLeave = () => {
        // Remove styles
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove("dragover")
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        // Remove styles
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove("dragover")
        }

        if (e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(file => {
                if (!file) return
                processFile(file, setSelectedFiles)
            })
        }
    }

    return (
        <form className="p-4" onSubmit={handleSubmit}>
            <div className="flex py-4">
                <div
                    ref={dropAreaRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "fixed inset-8 m-auto flex max-h-[45%] w-[45%] justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10",
                        selectedFiles.length > 0 && "m-[unset]",
                    )}
                >
                    <div className="text-center">
                        {/* Move svg into another file */}
                        <svg
                            className="mx-auto h-12 w-12 text-gray-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-1 hover:text-indigo-500"
                            >
                                <span>Upload a file</span>
                                <input
                                    multiple
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleInputChange}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                            up to 50MB
                        </p>
                    </div>
                </div>
                {selectedFiles.length > 0 && (
                    <div className="ml-auto flex w-1/2 flex-col space-y-4 rounded-lg bg-indigo-100 p-4 text-indigo-600">
                        <h2 className="text-xl font-semibold">Preview</h2>
                        <ul className="divide-y divide-gray-100">
                            {selectedFiles.map(file => (
                                <Item
                                    key={file.id}
                                    file={file}
                                    onRemove={handleDeleteSelectedFile}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </form>
    )
}

export default FileUpload
