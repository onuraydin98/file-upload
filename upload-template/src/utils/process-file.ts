import toast from "react-hot-toast"
import calcFileSize from "./file-size"
import { TCustomFile } from "@/components/FileUpload"

const processFile = (
    file: File,
    onChange: React.Dispatch<React.SetStateAction<TCustomFile[]>>,
    id: string,
) => {
    const reader = new FileReader()
    const { name, type, lastModified, size } = file
    let errorOccurred: boolean

    reader.onloadstart = () => {
        errorOccurred = false
        onChange(prev => {
            const existingFile = prev.find(prevFile => prevFile.id === id)

            if (existingFile) {
                // Reset error state when retrying
                existingFile.errorMsg = undefined
                return prev
            }

            // If not a duplicate, add a new file to the state
            return [
                ...prev,
                {
                    id: id,
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
                    prevFile.id === id
                        ? { ...prevFile, uploadProgress: progress }
                        : prevFile,
                ),
            )
        }
    }

    reader.onload = () => {
        // If any error has been occured.
        if (errorOccurred) {
            onChange(prev =>
                prev.map(prevFile =>
                    prevFile.id === id
                        ? {
                              ...prevFile,
                              errorMsg: "An error happens when reading file!",
                          }
                        : prevFile,
                ),
            )

            return
        }

        // Complete the missing fields on load
        onChange(prev =>
            prev.map(prevFile =>
                prevFile.id === id
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
    }

    reader.onerror = () => {
        errorOccurred = true
        toast.error(`An error has occured when uploading ${file.name}`, {
            id: "upload-error",
        })
    }

    // File size check
    if (calcFileSize(file.size) === "false") {
        return toast.error(`${file.name} is bigger than 50MB`, {
            id: "file-size-error",
        })
    }

    reader.readAsDataURL(file)

    // Cleanup
    return () => {
        errorOccurred = false
    }
}

export default processFile
