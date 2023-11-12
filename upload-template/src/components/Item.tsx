import { Trash2, File } from "lucide-react"
import ProgressBar from "@/components/ProgressBar"
import type { HTMLAttributes } from "react"
import type { TFile } from "@/components/FileUpload"

interface Props extends HTMLAttributes<HTMLDivElement> {
    file: TFile
    onRemove: (id: string) => void
}

const Item = ({ file, onRemove }: Props) => {
    // console.log("file", file)
    return (
        <li className="flex justify-between gap-x-6 py-2">
            <div className="flex min-w-0 flex-[1_1_70%] gap-x-4">
                {file.fileName.match(/.(jpg|jpeg|png|gif|svg|webp)$/i) ? (
                    <img
                        className="h-24 w-24 flex-none rounded-lg"
                        src={file.fileImage!}
                        alt={file.fileName}
                    />
                ) : (
                    <File size="6rem" className="text-gray-500" />
                )}
                <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                        {file.fileName}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {file.fileSize}
                    </p>
                    {file.uploadProgress !== undefined && (
                        // <progress
                        //     value={file.uploadProgress}
                        //     max="100"
                        //     className="mt-2 w-full rounded-lg"
                        // />
                        <ProgressBar progress={file.uploadProgress} />
                    )}
                </div>
            </div>
            <div className="hidden justify-between sm:flex sm:flex-col sm:items-end">
                <p className="mt-1 text-end text-xs leading-5 text-gray-500 [text-wrap:pretty]">
                    Last Modified: {file.dateTime}
                </p>
                <button
                    type="button"
                    className="group mb-2"
                    onClick={() => onRemove(file.id)}
                >
                    <Trash2
                        size="2rem"
                        className="text-rose-500 group-hover:text-opacity-70"
                    />
                </button>
            </div>
        </li>
    )
}

export default Item
