import { useState, type HTMLAttributes } from "react"
import { Trash2, File, RotateCcw } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import type { TCustomFile } from "@/components/FileUpload"

interface Props extends HTMLAttributes<HTMLDivElement> {
    file: TCustomFile
    onRemove: (id: string) => void
}

const Item = ({ file, onRemove }: Props) => {
    const { reader, rawFile } = file
    const [isAborted, setAborted] = useState(false)

    const handleAbortButtonDisplay = () => {
        if (reader.readyState === reader.DONE) return false
        if (file.errorMsg) return false
        if (isAborted) return false

        return true
    }
    const isAbortAvailable = handleAbortButtonDisplay()

    // --- Unit Test Start ---

    // const clickEvent = new MouseEvent("click", {
    //     bubbles: true,
    //     cancelable: true,
    //     view: window,
    // })

    // setTimeout(() => {
    //     // document.getElementById("abort")?.dispatchEvent(clickEvent)
    //     reader.dispatchEvent(new Event("error"))
    // }, 10)

    // --- Unit Test End ---

    reader.onabort = () => setAborted(true)

    return (
        <li className="flex justify-between gap-x-6 py-4 text-slate-50">
            <div className=" flex min-w-0 flex-1 gap-x-4">
                {file.fileName.match(/.(jpg|jpeg|png|gif|svg|webp)$/i) ? (
                    <img
                        className="h-24 w-24 flex-none rounded-lg"
                        src={file.fileImage!}
                        alt={file.fileName}
                    />
                ) : (
                    <File size="6rem" className="text-gray-300" />
                )}
                <div className="flex min-w-0 flex-auto flex-col ">
                    {(!isAborted || !!file.errorMsg) && (
                        <div className="flex-1">
                            <p className="line-clamp-1 text-sm font-semibold leading-6">
                                {file.fileName}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5">
                                {file.fileSize}
                            </p>
                        </div>
                    )}
                    {file.uploadProgress !== undefined && (
                        <ProgressBar
                            progress={file.uploadProgress}
                            isAborted={isAborted}
                            isError={!!file.errorMsg}
                        />
                    )}
                </div>
            </div>
            <div className="hidden justify-between sm:flex sm:flex-col sm:items-end">
                <p className="mt-1 text-end text-xs leading-5 text-gray-300 [text-wrap:pretty]">
                    Last Modified: {file.dateTime}
                </p>
                {file.errorMsg ? (
                    <button
                        type="button"
                        className="group mb-2"
                        onClick={() => {
                            reader.readAsDataURL(rawFile)
                        }}
                    >
                        <RotateCcw
                            size="2rem"
                            className="text-rose-300 group-hover:text-rose-400"
                        />
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {isAbortAvailable && (
                            <button
                                id="abort"
                                type="button"
                                disabled={!!file.errorMsg}
                                className=" rounded-lg border border-rose-300 px-2 py-1 text-rose-300 hover:bg-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:text-rose-600"
                                onClick={() => reader.abort()}
                            >
                                Abort
                            </button>
                        )}
                        {isAborted && (
                            <span className="text-rose-400">
                                Upload is aborted..
                            </span>
                        )}
                        <button
                            type="button"
                            className="group "
                            onClick={() => onRemove(file.id)}
                        >
                            <Trash2
                                size="2rem"
                                className="text-gray-200 group-hover:text-gray-300"
                            />
                        </button>
                    </div>
                )}
            </div>
        </li>
    )
}

export default Item
