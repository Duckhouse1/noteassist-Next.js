import { IntegrationOption } from "@/lib/Integrations/Types";
import Image from "next/image";

interface IntegrationOptionCardProps{
    card: IntegrationOption
    onClick: () => void
}

export default function IntegrationOptionCard({card, onClick}:IntegrationOptionCardProps) {
  return (
    <div className="h-17 hover:bg-gray-100 cursor-pointer group relative flex flex-col justify-between border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-md"
    onClick={onClick}
    >
      
      {/* Top Section */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
          <Image
            width={20}
            height={20}
            src={card.iconURL}
            alt={`${card.title} icon`}
            className="object-contain"
          />
        </div>

        {/* Text */}
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