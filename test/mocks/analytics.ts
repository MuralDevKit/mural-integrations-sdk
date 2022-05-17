import { getCtxItem, setCtxItem } from 'pickled-cucumber/context';

export interface AnalyticsPayload {
  userId: string;
  event: string;
  properties: { [k: string]: string };
}

export class MockAnalytics {
  track = ({
    userId,
    event,
    properties,
  }: {
    userId: string;
    event: string;
    properties: {};
  }) => {
    const payload = {
      userId,
      event,
      properties,
    } as AnalyticsPayload;

    setCtxItem('$trackingQueue', [
      ...(getCtxItem<AnalyticsPayload[]>('$trackingQueue') || []),
      payload,
    ]);
  };
}
