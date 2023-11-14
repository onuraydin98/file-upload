import cn from "@/utils/cn"

const ProgressBar = ({
    progress,
    isAborted,
    isError,
}: {
    progress: number
    isAborted: boolean
    isError: boolean
}) => {
    return (
        <div className="relative max-w-[80%] pt-1">
            <div className="flex gap-2">
                <div className="flex w-full rounded-lg bg-white shadow">
                    <div
                        style={{
                            width: `${progress}%`,
                        }}
                        className={cn(
                            "whitespace-nowrap rounded-lg bg-teal-500 py-2 text-center text-white shadow-none",
                            (isAborted || isError) && "bg-rose-500",
                        )}
                    />
                </div>
                <div>
                    <span
                        className={cn(
                            "inline-block rounded-lg bg-teal-300 px-2 py-1 text-xs font-semibold uppercase text-teal-600",
                            (isError || isAborted) &&
                                "bg-rose-300 text-rose-600",
                        )}
                    >
                        {`${isError ? 0 : progress.toFixed(2)}%`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ProgressBar
