export const NavItem = ({
    label,
    active,
    onClick,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={[
            "cursor-pointer relative px-1 py-1 text-sm font-medium transition-colors tracking-wider",
            active
                ? "text-[#1E3A5F]"
                : "text-slate-500 hover:text-black",
        ].join(" ")}
    >
        {label}
        {active && (
            <span className="absolute inset-x-0 -bottom-[17px] h-[2px] bg-[#1E3A5F] rounded-full" />
        )}
    </button>
);