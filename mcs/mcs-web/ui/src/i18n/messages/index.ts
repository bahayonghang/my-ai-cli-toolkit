import type { Locale } from "@/i18n/locale";
import { enCommonMessages, zhCommonMessages } from "./common";
import { enDashboardMessages, zhDashboardMessages } from "./dashboard";
import { enDialogMessages, zhDialogMessages } from "./dialogs";
import { enInstallMessages, zhInstallMessages } from "./install";
import { enInstalledMessages, zhInstalledMessages } from "./installed";
import { enInstallHubMessages, zhInstallHubMessages } from "./installHub";
import {
  enPlatformSelectMessages,
  zhPlatformSelectMessages,
} from "./platformSelect";

const enMessages = {
  ...enCommonMessages,
  ...enPlatformSelectMessages,
  ...enInstalledMessages,
  ...enInstallMessages,
  ...enDashboardMessages,
  ...enInstallHubMessages,
  ...enDialogMessages,
} as const;

type EnMessages = typeof enMessages;
export type MessageKey = keyof EnMessages;
export type LocaleMessages = Record<MessageKey, string>;

const zhMessages: LocaleMessages = {
  ...zhCommonMessages,
  ...zhPlatformSelectMessages,
  ...zhInstalledMessages,
  ...zhInstallMessages,
  ...zhDashboardMessages,
  ...zhInstallHubMessages,
  ...zhDialogMessages,
};

const enLocaleMessages: LocaleMessages = enMessages;

export const messagesByLocale: Record<Locale, LocaleMessages> = {
  en: enLocaleMessages,
  zh: zhMessages,
};
