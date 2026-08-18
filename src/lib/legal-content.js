import { APP_NAME, APP_SITE_URL, SUPPORT_EMAIL } from "@/lib/branding";

/** @typedef {{ title: string, body: string[] }} LegalSection */

/** @type {{ effectiveDate: string, intro: string[], sections: LegalSection[] }} */
export const PRIVACY_POLICY = {
  effectiveDate: "17 August 2026",
  intro: [
    `${APP_NAME} ("we", "us", "our") operates the ${APP_NAME} mobile web app and related services at ${APP_SITE_URL}. This Privacy Policy explains what information we collect, how we use it, and the choices you have.`,
    "By using the app, you agree to the collection and use of information as described here.",
  ],
  sections: [
    {
      title: "Information we collect",
      body: [
        "Account and sign-in: your mobile phone number when you verify with SMS OTP.",
        "Business profile: shop name, phone, address, UPI ID, business type, and optional logo you provide.",
        "Customer records: names and phone numbers you enter for your customers.",
        "Ledger data: bills, payment entries, amounts, dates, and notes you create in the app.",
        "App preferences: language, appearance (light/dark), and theme selections.",
        "Purchase records: when you buy paid bill or QR themes, we record the purchase through Razorpay or Google Play so your unlocks can be restored.",
        "Device and usage: basic technical data such as browser type and app errors may be collected by our hosting and analytics providers to keep the service running.",
      ],
    },
    {
      title: "How we use your information",
      body: [
        "Provide and maintain the billing and ledger features you use.",
        "Sign you in and restore your shop data when you log in on a new device.",
        "Sync and back up your data to our cloud database when cloud login is enabled.",
        "Process in-app theme purchases and prevent duplicate charges.",
        "Improve reliability, security, and support for the app.",
      ],
    },
    {
      title: "Where your data is stored",
      body: [
        "On your device: most shop data is stored locally in your browser (localStorage) so the app works offline.",
        "In the cloud: when you sign in with SMS, your data may be copied to our database hosted through Supabase.",
        "We do not sell your personal information or customer lists to advertisers.",
      ],
    },
    {
      title: "Sharing with others",
      body: [
        "You choose to share: when you send a bill or statement via WhatsApp, SMS, PDF, or UPI link, that content goes through the apps and services on your phone — not through our servers.",
        "Service providers: we use trusted processors to operate the app, including Supabase (database and auth), MSG91 (SMS OTP), Razorpay (web payments), and Google Play Billing (Android app purchases). They handle data only to provide their service to us.",
        "Legal requirements: we may disclose information if required by law or to protect the rights and safety of users and the public.",
      ],
    },
    {
      title: "Data retention",
      body: [
        "Cloud data remains until you delete it or ask us to delete your account.",
        "Data on your device stays until you clear browser storage, uninstall the app, or log out (which clears local data on that device).",
        "Purchase records may be kept longer where required for accounting, tax, or fraud prevention.",
      ],
    },
    {
      title: "Your choices",
      body: [
        "You can use the app without cloud login; in that case data stays on your device only.",
        "You can update or delete business and customer information inside the app.",
        "You can log out to remove local data from the current device.",
        `To delete your entire ${APP_NAME} account and cloud data, follow the steps at ${APP_SITE_URL}/account-deletion or email ${SUPPORT_EMAIL}.`,
      ],
    },
    {
      title: "Security",
      body: [
        "We use industry-standard measures such as encrypted connections (HTTPS) and access controls on our database.",
        "No method of storage or transmission is completely secure. You are responsible for keeping your phone secure and not sharing your SMS login codes.",
      ],
    },
    {
      title: "Children",
      body: [
        `${APP_NAME} is intended for business owners and is not directed at children under 18. We do not knowingly collect personal information from children.`,
      ],
    },
    {
      title: "Changes to this policy",
      body: [
        "We may update this Privacy Policy from time to time. We will post the revised version in the app and update the effective date above.",
        "Continued use after changes means you accept the updated policy.",
      ],
    },
    {
      title: "Contact us",
      body: [
        `Questions about this Privacy Policy or your data? Email us at ${SUPPORT_EMAIL}.`,
      ],
    },
  ],
};

/** @type {{ effectiveDate: string, intro: string[], sections: LegalSection[] }} */
export const ACCOUNT_DELETION = {
  effectiveDate: "18 August 2026",
  intro: [
    `${APP_NAME} is a billing app for Indian shops. If you created an account with your mobile number, you can ask us to delete that account and the shop data stored with it. This page explains how.`,
  ],
  sections: [
    {
      title: "How to request deletion",
      body: [
        `Email ${SUPPORT_EMAIL} from a mailbox you can access.`,
        `Use the subject line: Delete ${APP_NAME} account.`,
        "Include the 10-digit Indian mobile number you used to sign in, and the shop name if you remember it.",
        "We will verify the request and delete the account within 30 days. You will get a confirmation email when it is done.",
      ],
    },
    {
      title: "What we delete",
      body: [
        `Your ${APP_NAME} login (the mobile number used to sign in).`,
        "Shop profile: name, address, logo, UPI ID, and settings.",
        "Customers you added, including names and phone numbers.",
        "Bills, leftover due, and related ledger entries.",
        `Theme purchase records stored in ${APP_NAME}.`,
      ],
    },
    {
      title: "What we may keep",
      body: [
        "Google Play purchase history stays with Google. We cannot delete Play Store payment records.",
        "Encrypted backups may retain a copy for up to 30 days, then they are removed.",
        "We may keep a minimal record of the deletion request (date and mobile number) if the law requires it.",
      ],
    },
    {
      title: "After deletion",
      body: [
        "Deleting your account signs you out on all devices.",
        `You can create a new ${APP_NAME} shop later with the same number; it will start empty.`,
      ],
    },
  ],
};

/** @type {{ effectiveDate: string, intro: string[], sections: LegalSection[] }} */
export const TERMS_OF_SERVICE = {
  effectiveDate: "17 August 2026",
  intro: [
    `These Terms of Service ("Terms") govern your use of ${APP_NAME} ("Service") operated by us at ${APP_SITE_URL}.`,
    "By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
  ],
  sections: [
    {
      title: "The Service",
      body: [
        `${APP_NAME} helps small businesses in India track customer accounts, create bills, record payments, share statements, and display UPI payment QR codes.`,
        "The Service is a record-keeping and sharing tool. It is not accounting, tax, legal, or payment-processing software. You remain responsible for the accuracy of your business records and compliance with applicable laws.",
      ],
    },
    {
      title: "Eligibility and account",
      body: [
        "You must be at least 18 years old and able to form a binding contract to use the Service.",
        "You sign in with your mobile phone number and SMS verification. You are responsible for keeping access to that number and for all activity under your account.",
        "You must provide accurate business information and must not impersonate another person or business.",
      ],
    },
    {
      title: "Your content and customers",
      body: [
        "You own the customer names, phone numbers, bills, and other data you enter.",
        "You grant us a limited license to store, process, and back up that data solely to operate the Service for you.",
        "You must have a lawful basis to store and share your customers' contact details and must not use the Service for spam or harassment.",
      ],
    },
    {
      title: "Acceptable use",
      body: [
        "You agree not to misuse the Service, attempt to access other users' data, interfere with security, reverse engineer the app, or use it for unlawful purposes.",
        "We may suspend or terminate access if we reasonably believe you have violated these Terms or pose a risk to the Service or other users.",
      ],
    },
    {
      title: "Paid themes and purchases",
      body: [
        "Some bill and QR themes require a one-time purchase through Razorpay (web) or Google Play Billing (Android app).",
        "Prices are shown in Indian Rupees (INR) before checkout. Applicable taxes may apply as determined by the payment provider.",
        "Digital theme purchases are generally non-refundable once delivered, except where required by law or the relevant app store policy.",
        "Theme unlocks are tied to your account. We do not guarantee compatibility with future devices, platforms, or third-party payment systems.",
      ],
    },
    {
      title: "Third-party services",
      body: [
        "Sharing via WhatsApp, SMS, UPI apps, Razorpay, Google Play, and SMS delivery are provided by third parties under their own terms and privacy policies.",
        "We are not responsible for outages, fees, or actions of those third-party services.",
      ],
    },
    {
      title: "Availability and changes",
      body: [
        "We aim to keep the Service available but do not guarantee uninterrupted or error-free operation.",
        "We may modify, suspend, or discontinue features with reasonable notice where practicable.",
        "We may update these Terms from time to time. Material changes will be posted in the app. Continued use after changes constitutes acceptance.",
      ],
    },
    {
      title: "Disclaimer of warranties",
      body: [
        `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
        "We do not warrant that calculations, balances, backups, or shared messages will always be accurate or delivered.",
      ],
    },
    {
      title: "Limitation of liability",
      body: [
        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, or business opportunities arising from your use of the Service.",
        "Our total liability for any claim relating to the Service is limited to the greater of (a) the amount you paid us in the twelve months before the claim, or (b) INR 1,000.",
      ],
    },
    {
      title: "Indemnity",
      body: [
        "You agree to indemnify and hold us harmless from claims arising out of your use of the Service, your customer data, your sharing of bills or messages, or your violation of these Terms or applicable law.",
      ],
    },
    {
      title: "Governing law",
      body: [
        "These Terms are governed by the laws of India. Courts in India shall have exclusive jurisdiction, subject to any mandatory consumer protection rights you may have.",
      ],
    },
    {
      title: "Contact",
      body: [
        `For questions about these Terms, contact us at ${SUPPORT_EMAIL}.`,
      ],
    },
  ],
};
