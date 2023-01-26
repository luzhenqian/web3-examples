export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

declare const window: any;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageView = (url: string) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
