import toast from "react-hot-toast"
import { v4 as uuid } from "uuid"
import calcFileSize from "./file-size"
import { TCustomFile } from "@/components/FileUpload"

const processFile = (
    file: File,
    onChange: React.Dispatch<React.SetStateAction<TCustomFile[]>>,
) => {
    const reader = new FileReader()
    const { name, type, lastModified, size } = file
    const fileId = uuid().slice(0, 8)
    let errorOccurred = false

    console.log("file", file)

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

export default processFile
