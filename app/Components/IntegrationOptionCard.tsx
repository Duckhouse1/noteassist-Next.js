import { IntegrationOption } from "@/lib/Integrations/Types";
import Image from "next/image";

interface IntegrationOptionCardProps {
  card: IntegrationOption;
  onClick: () => void;
}

export default function IntegrationOptionCard({
  card,
  onClick,
}: IntegrationOptionCardProps) {
  const isComingSoon = card.commingSoon;

  return (
    <div
      className={`
    relative h-full flex flex-col justify-between border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300
    ${isComingSoon
          ? "opacity-70 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer hover:shadow-md"}
  `}
      onClick={!isComingSoon ? onClick : undefined}
    >
      {/* Smaller Corner Ribbon */}
      {isComingSoon && (
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
          <div
            className="
              absolute
              top-3
              right-[-36px]
              rotate-45
              bg-gradient-to-r from-indigo-600 to-purple-600
              text-white
              text-[9px]
              font-semibold
              tracking-wide
              py-0.5
              w-32
              text-center
              shadow-sm
            "
          >
            ~ Coming Soon
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
          <Image
            width={20}
            height={20}
            src={card.iconURL}
            alt={`${card.title} icon`}
            className={`object-contain ${isComingSoon ? "grayscale" : ""}`}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {card.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
}