/** Public readiness is not a connection state. Never derive it from fictional sample accounts. */
export type IntegrationId =
  'whatsapp' | 'gmail' | 'instagram' | 'facebook' | 'assistant' | 'pdf' | 'spreadsheets';
export type IntegrationStatusLabel = 'Available' | 'Coming soon' | 'Planned';
export type IntegrationDefinition = {
  id: IntegrationId;
  name: string;
  shortName: string;
  group: 'channel' | 'companion' | 'download';
  label: string;
  status: IntegrationStatusLabel;
  purpose: string;
  readiness: string;
  priority: string;
  logo?: string;
  path: string;
};

export const integrationStatuses: readonly IntegrationDefinition[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    shortName: 'WhatsApp Business',
    group: 'channel',
    label: 'Your customer conversations',
    status: 'Coming soon',
    priority: '02 / Second major channel',
    purpose:
      'Bring conversations from your business’s own WhatsApp account into the shared workspace.',
    readiness:
      'Implementation and sandbox flow exist. Meta approval, business setup and live delivery validation are still required. This is not Invend’s own WhatsApp Assistant.',
    logo: '/images/integrations/whatsapp.svg',
    path: 'M198 157 C340 157 335 230 550 230',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    shortName: 'Gmail',
    group: 'channel',
    label: 'First in our rollout',
    status: 'Coming soon',
    priority: '01 / First planned live channel',
    purpose:
      'Keep sales emails and the customer context behind them in one place. Gmail is our first planned live channel.',
    readiness:
      'OAuth and the message pipeline exist. Google configuration and authorised live acceptance remain pending. There is no live connection in this illustration.',
    logo: '/images/integrations/gmail.svg',
    path: 'M902 106 C749 106 767 230 550 230',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    group: 'channel',
    label: 'For the conversations ahead',
    status: 'Planned',
    priority: 'Later / After Gmail and WhatsApp',
    purpose:
      'A future home for Instagram business conversations, alongside your other customer enquiries.',
    readiness:
      'Messaging implementation and Meta review are still required. Sample Instagram conversations do not represent an available connection.',
    logo: '/images/integrations/instagram.svg',
    path: 'M154 330 C339 330 329 230 550 230',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'Facebook',
    group: 'channel',
    label: 'One less inbox to juggle',
    status: 'Planned',
    priority: 'Later / After Gmail and WhatsApp',
    purpose:
      'The roadmap includes Facebook Messenger conversations for your business, without another disconnected inbox.',
    readiness:
      'A live Messenger integration is not implemented or approved in this build. Platform setup and Meta approval will be needed.',
    logo: '/images/integrations/facebook.svg',
    path: 'M946 314 C762 314 768 230 550 230',
  },
  {
    id: 'assistant',
    name: 'Invend WhatsApp Assistant',
    shortName: 'Invend WhatsApp Assistant',
    group: 'companion',
    label: 'A companion for you',
    status: 'Coming soon',
    priority: 'Separate companion / Not a customer inbox',
    purpose:
      'Talk to Invend from your own WhatsApp: check supported business information and review permitted tasks.',
    readiness:
      'Limited implementation includes today’s order count and owner/manager stock or price instructions with explicit YES confirmation. Live setup and validation are pending; wider assistant tasks are not claimed.',
    path: 'M550 459 L550 230',
  },
  {
    id: 'pdf',
    name: 'Receipt PDFs',
    shortName: 'Receipt PDFs',
    group: 'download',
    label: 'A portable record',
    status: 'Available',
    priority: 'Download format / Not a channel',
    purpose: 'Download an issued, payment-confirmed receipt as a PDF from the order workspace.',
    readiness:
      'Receipt PDF generation and download are implemented. This is a file download, not a third-party connection or a general report-export feature. Sample receipts are watermarked.',
    path: 'M264 498 L264 461 Q264 420 333 420 L480 420 Q550 420 550 350 L550 230',
  },
  {
    id: 'spreadsheets',
    name: 'CSV & Excel-compatible exports',
    shortName: 'Spreadsheet exports',
    group: 'download',
    label: 'Portable files, not live sync',
    status: 'Planned',
    priority: 'Download formats / Not direct integrations',
    purpose:
      'Planned CSV and Excel-compatible downloads would help you take business information into other tools.',
    readiness:
      'CSV/XLSX export is not implemented. Direct Google Sheets or Google Docs integration is not available or implied; a future file download would be a separate capability.',
    path: 'M858 487 L858 461 Q858 420 787 420 L620 420 Q550 420 550 350 L550 230',
  },
];
