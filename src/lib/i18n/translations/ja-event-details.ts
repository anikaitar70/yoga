import type { EventDetailLocaleContent } from "@/lib/event-detail";
import { lookupJaEventPatch } from "@/lib/i18n/translations/ja-events";

const DEFAULT_REGISTRATION_JA = {
  enabled: false,
  label: "このイベントに登録する",
  googleFormUrl: "",
};

/** Machine-translated Read More panels keyed by slug/title — merged when locale is ja and status is MACHINE. */
const MACHINE_EVENT_DETAILS_BY_KEY: Record<string, EventDetailLocaleContent> = {
  "Rejuvenation, Therapy, Lifestyle": {
    subtitle: "",
    sections: [
      {
        id: "machine-india-retreat",
        type: "TEXT",
        title: "このイベントについて",
        paragraphs: [
          "インドでのリトリート — ヨガ、アーユルヴェーダ療法、ヨガニドラ、瞑想、文化体験。",
        ],
      },
    ],
    registration: { ...DEFAULT_REGISTRATION_JA },
  },
};

function buildMachineDetailFromCardPatch(event: {
  slug: string;
  title: string;
}): EventDetailLocaleContent | undefined {
  const patch = lookupJaEventPatch(event);
  if (!patch?.description) return undefined;

  return {
    subtitle: "",
    sections: [
      {
        id: `machine-${event.slug.replace(/\s+/g, "-")}`,
        type: "TEXT",
        title: "このイベントについて",
        paragraphs: [patch.description],
      },
    ],
    registration: { ...DEFAULT_REGISTRATION_JA },
  };
}

export function lookupJaEventDetailPatch(event: {
  slug: string;
  title: string;
}): EventDetailLocaleContent | undefined {
  const trimmedTitle = event.title.trim();
  return (
    MACHINE_EVENT_DETAILS_BY_KEY[event.slug] ??
    MACHINE_EVENT_DETAILS_BY_KEY[trimmedTitle] ??
    buildMachineDetailFromCardPatch(event)
  );
}

export function mergeMachineRegistration(
  machine: EventDetailLocaleContent,
  english: EventDetailLocaleContent,
): EventDetailLocaleContent["registration"] {
  const enReg = english.registration;
  const machineReg = machine.registration ?? { ...DEFAULT_REGISTRATION_JA };

  if (!enReg?.enabled || !enReg.googleFormUrl.trim()) {
    return machineReg;
  }

  return {
    enabled: true,
    label: machineReg.label || DEFAULT_REGISTRATION_JA.label,
    googleFormUrl: enReg.googleFormUrl,
  };
}
