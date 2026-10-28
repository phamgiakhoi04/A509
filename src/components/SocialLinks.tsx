import type { SVGProps } from "react";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M13.8 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.8V3.1A23 23 0 0 0 14.6 3c-2.6 0-4.3 1.6-4.3 4.5v2.1H7.5v3.2h2.8V21z" /></svg>;
}
function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5z" /></svg>;
}
function XIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.2-8.3L1.8 2h6.5l4.4 6.7L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" /></svg>;
}
const socials = [
  { name: "Facebook", href: "https://www.facebook.com/A509VN", Icon: FacebookIcon },
  { name: "YouTube", href: "https://www.youtube.com/@A509VN", Icon: YoutubeIcon },
  { name: "X", href: "https://x.com/A509VN?s=20", Icon: XIcon },
];

export default function SocialLinks({ light = false }: { light?: boolean }) {
  return <nav aria-label="Mạng xã hội A509" className="flex flex-wrap items-center gap-3">
    {socials.map(({ name, href, Icon }) => <a key={name} href={href} target="_blank" rel="noopener noreferrer"
      aria-label={`A509 trên ${name}`} title={name}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${light ? "border-white/35 text-white hover:border-white hover:bg-white/10" : "border-[#ccc] text-[#a51e22] hover:border-[#a51e22] hover:bg-red-50"}`}>
      <Icon className="h-5 w-5" />
    </a>)}
  </nav>;
}
