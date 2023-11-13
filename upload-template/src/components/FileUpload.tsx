import { useRef, useState } from "react"
import axios from "axios"
import { v4 as uuid } from "uuid"
import toast from "react-hot-toast"
import calcFileSize from "@/utils/file-size"
import { Image } from "lucide-react"
import cn from "@/utils/cn"
import Item from "@/components/Item"
import ProgressBar from "./ProgressBar"

export type TCustomFile = {
    id: string
    fileName: string
    fileType: string
    fileImage: string | null
    dateTime: string
    fileSize: string
    uploadProgress?: number
    reader: FileReader
    rawFile: File
    errorMsg?: string
}

const processFile = (
    file: File,
    onChange: React.Dispatch<React.SetStateAction<TCustomFile[]>>,
) => {
    const reader = new FileReader()
    const { name, type, lastModified, size } = file
    const fileId = uuid().slice(0, 8)
    let errorOccurred = false

    reader.onloadstart = () => {
        errorOccurred = false
        onChange(prev => {
            const existingFile = prev.find(prevFile => prevFile.id === fileId)

            if (existingFile) {
                // Reset error state when retrying
                existingFile.errorMsg = undefined
                return prev
            }

            // If not a duplicate, add a new file to the state
            return [
                ...prev,
                {
                    id: fileId,
                    fileName: name,
                    fileType: "",
                    dateTime: "",
                    fileImage: "",
                    fileSize: calcFileSize(size),
                    uploadProgress: 0,
                    reader: reader,
                    rawFile: file,
                },
            ]
        })
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

    reader.onload = () => {
        // Set uploadProgress to 100 when the file is fully loaded
        if (errorOccurred) {
            onChange(prev =>
                prev.map(prevFile =>
                    prevFile.id === fileId
                        ? {
                              ...prevFile,
                              errorMsg: "An error happens when reading file!",
                          }
                        : prevFile,
                ),
            )

            return
        }

        onChange(prev =>
            prev.map(prevFile =>
                prevFile.id === fileId
                    ? {
                          ...prevFile,
                          fileType: type,
                          dateTime: new Date(lastModified).toLocaleString(
                              "tr-TR",
                          ),
                          uploadProgress: 100,
                          fileImage: reader.result as string,
                      }
                    : prevFile,
            ),
        )
        // You can add additional logic here after the file is loaded
        console.log("load ended", file.name)
    }

    reader.onerror = () => {
        errorOccurred = true
        toast.error(`An error has occured when uploading ${file.name}`, {
            id: "upload-error",
        })
    }

    if (calcFileSize(file.size) === "false") {
        return toast.error(`${file.name} is bigger than 50MB`, {
            id: "file-size-error",
        })
    }

    reader.readAsDataURL(file)
}

export const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState<TCustomFile[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isLoading, setLoading] = useState(false)

    const abortControllerRef = useRef<AbortController | null>(null)
    const dropAreaRef = useRef<HTMLDivElement | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploadProgress(0)
        setLoading(true)

        try {
            const formData = new FormData()
            const formArray: File[] = []

            // Append each selected file to the FormData object
            selectedFiles.forEach(file => {
                formData.append("files", file.rawFile)
                formArray.push(file.rawFile)
            })

            // Make sure there are files to upload
            if (formData.getAll("files").length === 0) {
                toast.error("No files selected for upload", {
                    id: "no-files-error",
                })
                return
            }

            // Abort Controller
            const abortController = new AbortController()
            abortControllerRef.current = abortController

            const response = await axios
                .post("https://httpbin.org/post", formData, {
                    // Track the upload progress
                    onUploadProgress: progressEvent => {
                        const loaded = progressEvent.loaded
                        const total = progressEvent.total
                        //@ts-expect-error Will be fixed
                        const progress = Math.round((loaded / total) * 100)

                        // Update the state to track the progress
                        setUploadProgress(progress)
                    },
                    signal: abortController.signal,
                })
                .finally(() => {
                    setLoading(false)
                })

            // Check if the request was successful
            if (response.status === 200) {
                toast.success("Files uploaded successfully!", {
                    id: "upload-success",
                })
                // Reset the selectedFiles state after successful upload
                setSelectedFiles([])
                setUploadedFiles(prev => [...prev, ...formArray])
            } else {
                toast.error(`Failed to upload files: ${response.statusText}`, {
                    id: "upload-fail",
                })
            }
        } catch (error) {
            // Check if the upload was aborted by the user
            if (axios.isCancel(error)) {
                toast.error("Upload aborted by user", {
                    id: "upload-abort",
                })
            } else {
                toast.error(
                    `Error during file upload: ${(error as Error).message}`,
                    {
                        id: "upload-error",
                    },
                )
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
                if (!file) return
                processFile(file, setSelectedFiles)
            })
        }
    }

    const handleDeleteSelectedFile = (id: string) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            const result = selectedFiles.filter(data => data.id !== id)
            setSelectedFiles(result)
        }
    }

    const handleAbortUpload = () => abortControllerRef.current?.abort()

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

    console.log("overAll Progress", uploadProgress)
    // uploadedFiles.forEach(e => console.log("uploaded", e))
    console.log("form", uploadedFiles)

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex py-4">
                <div
                    className={cn(
                        "fixed inset-8 h-fit w-[45%] translate-x-[60%] translate-y-0 space-y-8 transition-transform duration-300",
                        selectedFiles.length > 0 &&
                            "translate-x-0 translate-y-0",
                        // !selectedFiles.length &&
                        //     uploadedFiles.length > 0 &&
                        //     "-translate-y-[30%] translate-x-0",
                    )}
                >
                    <div
                        ref={dropAreaRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            " m-auto flex justify-center rounded-lg border border-dashed border-gray-100 px-6 py-10",
                            selectedFiles.length > 0 && "m-[unset]",
                        )}
                    >
                        <div className="text-center">
                            <Image className="m-auto h-24 w-24 text-gray-300" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md px-2 font-semibold text-rose-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-rose-600 focus-within:ring-offset-1 hover:text-rose-500"
                                >
                                    <span>Add a file</span>
                                    <input
                                        multiple
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <p className="pl-1 text-slate-50">
                                    or drag and drop
                                </p>
                            </div>
                            <p className="text-xs leading-5 text-slate-400">
                                up to 50MB
                            </p>
                        </div>
                    </div>
                    <div className="ml-auto flex flex-col space-y-4 rounded-lg">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">
                                Uploaded Files
                            </h2>
                            {isLoading && (
                                <button
                                    type="button"
                                    onClick={handleAbortUpload}
                                    className="rounded-lg border border-rose-300 px-2 py-1 text-rose-300 hover:bg-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:text-rose-600"
                                >
                                    Abort Upload
                                </button>
                            )}
                        </div>

                        {
                            <ProgressBar
                                progress={uploadProgress}
                                isAborted={
                                    abortControllerRef.current?.signal
                                        .aborted || false
                                }
                                isError={false}
                            />
                        }

                        {uploadedFiles.length > 0 && (
                            <ul className="max-h-[40dvh] divide-y divide-gray-100 overflow-y-auto overscroll-contain">
                                {uploadedFiles.map(file => (
                                    <li
                                        key={`${file.name}-${
                                            Math.random() * 100
                                        }`}
                                        className="flex justify-between py-2"
                                    >
                                        <p>{file.name}</p>
                                        <p>{calcFileSize(file.size)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                {selectedFiles.length > 0 && (
                    <div className="ml-auto flex w-1/2 flex-col space-y-4 rounded-lg  p-4 text-rose-600">
                        <div className="flex justify-between border-b border-rose-300 pb-4">
                            <h2 className="text-2xl font-semibold">Preview</h2>
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="rounded-lg border border-rose-300 px-2 py-1 hover:bg-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:text-rose-600"
                            >
                                {isLoading ? "Uploading.." : "Upload"}
                            </button>
                        </div>

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
