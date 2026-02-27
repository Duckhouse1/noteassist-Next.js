
import { OutlookMeetingDuration, OutlookSettings } from "@/lib/Integrations/Outlook/Configuration";

type Props = {
  config?: OutlookSettings;
  // data: FetchedADOData | null;
  onPatch: (patch: Partial<OutlookSettings>) => void;
};

export default function OutlookConfigPanel({ config, onPatch }: Props) {
  const MEETING_DURATIONS: OutlookMeetingDuration[] = [15, 30, 60, 90];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">

      {/* Default Signature */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-gray-800">
            Default Signature
          </h2>
          <p className="text-xs text-gray-400">
            This signature will be appended to generated emails.
          </p>
        </div>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900
           shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 resize-none "
          placeholder="Best regards,&#10;Your Name"
          value={config?.defaultSignature ?? ""}
          onChange={(e) => onPatch({ defaultSignature: e.target.value })}
        />
      </div>

      {/* Default Meeting Duration */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Default Meeting Duration</h2>
        <select
          className="border border-gray-400 rounded p-2"
          value={config?.meetingDurationDefault}
          onChange={(e) =>
            onPatch({
              meetingDurationDefault: Number(e.target.value) as OutlookMeetingDuration,
            })
          }
        >
          {MEETING_DURATIONS.map((duration) => (
            <option key={duration} value={duration}>
              {duration} minutes
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}