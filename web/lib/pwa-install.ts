export type InstallInstructions = {
  platform: string;
  title: string;
  steps: readonly string[];
  note: string;
};

/** Guidance only. Never infer a successful installation from the browser or device name. */
export function installInstructions(userAgent: string, maxTouchPoints = 0): InstallInstructions {
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1))
    return {
      platform: 'iPhone or iPad',
      title: 'Add Invend to your home screen',
      steps: [
        'Open this page in Safari and open the Share menu.',
        'Choose Add to Home Screen. You may need to scroll through the menu.',
        'Confirm Add, then open Invend from your home screen.',
      ],
      note: 'If you are inside another app’s browser, open this page in Safari first.',
    };
  if (/Android/i.test(userAgent))
    return {
      platform: 'Android',
      title: 'Keep Invend on your home screen',
      steps: [
        'Open this page in your browser, outside any social app’s in-app browser.',
        'Open the browser menu and look for Install app or Add to Home screen.',
        'Follow the browser’s confirmation. The exact menu wording varies by browser.',
      ],
      note: 'If no install option appears, try an up-to-date Chrome or Edge browser. You can still use Invend on the web.',
    };
  if (
    /Macintosh/i.test(userAgent) &&
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|Edg|OPR/i.test(userAgent)
  )
    return {
      platform: 'Safari on Mac',
      title: 'Add Invend to your Dock',
      steps: [
        'In a supported version of Safari, open the File menu.',
        'Choose Add to Dock and confirm the name.',
        'Open Invend from your Dock. It remains a web app.',
      ],
      note: 'Add to Dock requires Safari on macOS Sonoma or later. If it is unavailable, use a bookmark or another supported browser.',
    };
  if (/Edg\//i.test(userAgent))
    return {
      platform: 'Microsoft Edge',
      title: 'Open Invend in its own window',
      steps: [
        'Open the Edge menu and choose Apps.',
        'Choose Install this site as an app, if offered.',
        'Confirm the browser prompt to add Invend to this device.',
      ],
      note: 'This installs on the device you are using, not on a different phone.',
    };
  if (/Chrome|Chromium/i.test(userAgent))
    return {
      platform: 'Chrome or Chromium',
      title: 'Install Invend on this device',
      steps: [
        'Look for the install icon in the address bar, or open the browser menu.',
        'Look under Cast, save and share for an install option. Menu wording can vary.',
        'Confirm the browser prompt. If no option appears, keep using the web workspace.',
      ],
      note: 'This installs on the device you are using. To install on your phone, open Invend in that phone’s browser.',
    };
  return {
    platform: 'Your browser',
    title: 'A home-screen shortcut to your business',
    steps: [
      'This browser has not offered a native installation prompt.',
      'Open Invend in Chrome, Edge or supported Safari and look for its install option.',
      'Or bookmark the workspace and continue using it in your current browser.',
    ],
    note: 'Installation options depend on the browser and operating system. There is no separate app-store download.',
  };
}
