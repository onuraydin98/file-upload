import { useRef, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Image, RotateCcw } from "lucide-react"
import ProgressBar from "./ProgressBar"
import Item from "@/components/Item"
import calcFileSize from "@/utils/file-size"
import cn from "@/utils/cn"
import processFile from "@/utils/process-file"

type IdByFileName = {
    id: string
}

type UploadProgress = IdByFileName & {
    progress: number
}

type Controller = IdByFileName & {
    controller: AbortController
}

export type TCustomFile = {
    id: string
    fileName: string
    fileType: string
    fileImage: string | null
    dateTime: string
    fileSize: string
    reader: FileReader
    rawFile: File
    uploadProgress?: number
    errorMsg?: string
}

export const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState<TCustomFile[]>([])

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [uploadError, setUploadError] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

    const [isLoading, setLoading] = useState(false)

    const abortControllersRef = useRef<Controller[]>([])
    const inputRef = useRef<HTMLInputElement | null>(null)
    const dropAreaRef = useRef<HTMLDivElement | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setUploadError(false)

        try {
            await Promise.allSettled(
                selectedFiles.map(async (file, index) => {
                    const formData = new FormData()
                    const formArray: File[] = []

                    // Append each selected file to the FormData object
                    formData.append("files", file.rawFile)
                    formArray.push(file.rawFile)

                    // Make sure there are files to upload
                    if (formData.getAll("files").length === 0) {
                        toast.error("No files selected for upload", {
                            id: "no-files-error",
                        })
                        return
                    }

                    // Abort Controller
                    const abortController = new AbortController()
                    abortControllersRef.current[index] = {
                        id: file.fileName,
                        controller: abortController,
                    }

                    const response = await axios.post(
                        "https://httpbin.org/post",
                        formData,
                        {
                            // Track the upload progress
                            onUploadProgress: progressEvent => {
                                const loaded = progressEvent.loaded
                                const total = progressEvent.total
                                const progress = Math.round(
                                    //@ts-expect-error Total
                                    (loaded / total) * 100,
                                )

                                // Update the state to track the progress
                                setUploadProgress(prev =>
                                    prev.map(prevProgress =>
                                        prevProgress.id === file.fileName
                                            ? {
                                                  ...prevProgress,
                                                  progress: progress,
                                              }
                                            : prevProgress,
                                    ),
                                )
                            },
                            signal: abortController.signal,
                        },
                    )

                    // Check if the request was successful
                    if (response.status === 200) {
                        toast.success(`${file.fileName} uploaded successfully!`)
                        // Filter selectedFiles state after successful upload individually
                        setSelectedFiles(prev =>
                            prev.filter(_ => _.id !== file.id),
                        )
                        setUploadedFiles(prev => [...prev, ...formArray])
                    } else {
                        const errorMessage = `Failed to upload ${file.fileName}`
                        toast.error(errorMessage, {
                            id: `upload-fail-${file.id}`,
                        })
                    }
                }),
            ).then(res => {
                setUploadProgress(prev =>
                    prev.filter(prevProgress => prevProgress.progress !== 100),
                )
                // Process results and error handling
                const errorArray = res.map(
                    result => result.status === "rejected",
                )

                if (errorArray.length > 0 && errorArray.some(val => val)) {
                    setUploadError(true)
                    toast.error("Some files can not be uploaded!", {
                        id: `upload-error-all-settled`,
                    })
                }
                setLoading(false)
            })
        } catch (error) {
            // Check if the upload was aborted by the user
            toast.error(
                `Error during file upload: ${(error as Error).message}`,
                {
                    id: "upload-error",
                },
            )
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
                if (!file) return
                setUploadProgress(prev => [
                    ...prev,
                    { id: file.name, progress: 0 },
                ])
                processFile(file, setSelectedFiles)
            })
            if (!inputRef.current) return
            inputRef.current.value = ""
        }
    }

    const handleDeleteSelectedFile = (id: string) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            const result = selectedFiles.filter(data => data.id !== id)
            setSelectedFiles(result)

            if (!result.length) setUploadError(false)

            // Reset uploadProgress states via filename based id's
            const resultFileNames = result.map(data => data.fileName)
            setUploadProgress(prev =>
                prev.filter(_ => resultFileNames.includes(_.id)),
            )
            // abortControllersRef.current = abortControllersRef.current.filter(
            //     controllerObj => resultFileNames.includes(controllerObj.id),
            // )
        }
    }
    console.log("abortControllRef", abortControllersRef)

    // console.log("uploadProgress", uploadProgress)
    console.log("uploadError", uploadError)
    console.log("selected", selectedFiles)

    const handleAbortUpload = (id: string) => {
        const controllerCurrent = abortControllersRef.current.find(val => {
            return val.id === id
        })
        controllerCurrent?.controller.abort()

        toast.error(`${id} upload aborted by user`, {
            id: "upload-abort",
        })
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
                setUploadProgress(prev => [
                    ...prev,
                    { id: file.name, progress: 0 },
                ])
                processFile(file, setSelectedFiles)

                if (!inputRef.current) return
                inputRef.current.value = ""
            })
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex py-4">
                <div
                    className={cn(
                        "fixed inset-8 h-fit w-[45%] translate-x-[60%] translate-y-0 space-y-8 transition-transform duration-300",
                        selectedFiles.length > 0 &&
                            "translate-x-0 translate-y-0",
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
                                        ref={inputRef}
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
                    {(uploadedFiles.length > 0 || selectedFiles.length > 0) && (
                        <div className=" ml-auto flex flex-col space-y-4 rounded-lg">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <h2 className="text-xl font-semibold">
                                    Uploaded Files
                                </h2>
                            </div>
                            <div
                                id="uploaded-file-list"
                                className="max-h-[calc(100dvh-400px)] space-y-4 overflow-y-auto overscroll-contain"
                            >
                                {selectedFiles.map((_, idx) => (
                                    <div
                                        key={`progress-upload-${idx}`}
                                        className="flex-col gap-4"
                                    >
                                        <p>{_.fileName}</p>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <ProgressBar
                                                    progress={
                                                        uploadProgress.find(
                                                            obj =>
                                                                obj.id ===
                                                                _.fileName,
                                                        )?.progress ?? 0
                                                    }
                                                    isAborted={
                                                        abortControllersRef.current.find(
                                                            val =>
                                                                val.id ===
                                                                _.fileName,
                                                        )?.controller.signal
                                                            .aborted || false
                                                    }
                                                    isError={uploadError}
                                                />
                                            </div>
                                            {isLoading && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAbortUpload(
                                                            _.fileName,
                                                        )
                                                    }
                                                    className="rounded-lg border border-rose-300 px-2 py-1 text-rose-300 hover:bg-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:text-rose-600"
                                                >
                                                    Abort
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {uploadedFiles.length > 0 && (
                                    <ul className=" divide-y divide-gray-100">
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
                    )}
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
                                {uploadError ? (
                                    <RotateCcw
                                        size="2rem"
                                        className="text-rose-300 hover:text-slate-50"
                                    />
                                ) : isLoading ? (
                                    "Uploading.."
                                ) : (
                                    "Upload"
                                )}
                            </button>
                        </div>

                        <ul className="divide-y divide-gray-100">
                            {selectedFiles.map(file => (
                                <Item
                                    key={file.id}
                                    file={file}
                                    onRemove={handleDeleteSelectedFile}
                                    isLoading={isLoading}
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
