

export type OutlookMeetingDuration = 15 | 30 | 60 | 90;

export type OutlookSettings = {
  defaultSignature: string;
  sendAsAlias: string;
  requestReadReceipts: boolean;
  autoCcEnabled: boolean;
  autoCcAddress: string;
  meetingDurationDefault: OutlookMeetingDuration;
  includeTeamsLink: boolean;
  outLookDraft: boolean;
  OutlookMeeting: boolean;
};