import Image from "next/image";
import gpaySrc from "../../public/google-pay.png";
import phonePeSrc from "../../public/phone-pe.png";
import paytmSrc from "../../public/paytm.png";
import upiSrc from "../../public/UPI-Logo.webp";
import { cn } from "@/lib/utils";

const LOGOS = [
  { src: gpaySrc, alt: "Google Pay", className: "size-6 rounded-md" },
  { src: phonePeSrc, alt: "PhonePe", className: "size-6 rounded-md" },
  { src: paytmSrc, alt: "Paytm", className: "size-7" },
  { src: upiSrc, alt: "UPI", className: "h-5 w-[3.6rem]" },
];

export function UpiAppLogos({ className }) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-center gap-5", className)}
      aria-label="Google Pay, PhonePe, Paytm, UPI"
    >
      {LOGOS.map((logo) => (
        <Image
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          className={cn("shrink-0 object-contain", logo.className)}
        />
      ))}
    </div>
  );
}
