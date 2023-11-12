const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div className="relative pt-1">
            <div className="flex gap-2">
                <div className="bg-grey-light flex w-full rounded-lg shadow">
                    <div
                        style={{ width: `${progress}%` }}
                        className="whitespace-nowrap rounded-lg bg-teal-500 py-2 text-center text-white shadow-none"
                    />
                </div>
                <div>
                    <span className="inline-block rounded-lg bg-teal-300 px-2 py-1 text-xs font-semibold uppercase text-teal-600">
                        {`${progress}%`}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ProgressBar
