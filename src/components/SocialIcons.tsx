type IconProps = {
  className?: string;
};

export function TwitterIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.81 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.376.55A3.017 3.017 0 00.502 6.186 31.4 31.4 0 000 12a31.4 31.4 0 00.502 5.814 3.016 3.016 0 002.122 2.136C4.495 20.5 12 20.5 12 20.5s7.505 0 9.376-.55a3.016 3.016 0 002.122-2.136A31.4 31.4 0 0024 12a31.4 31.4 0 00-.502-5.814zM9.75 15.5v-7l6.5 3.5z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82c-1.0-.93-1.6-2.25-1.6-3.7h-3.07v13.6a2.69 2.69 0 11-2.7-2.69c.3 0 .58.05.85.13v-3.13a5.78 5.78 0 00-.85-.06A5.81 5.81 0 105.81 15.6V9.66a8.85 8.85 0 005.13 1.64v-3.07a5.7 5.7 0 002.6.62V5.82H16.6z" />
    </svg>
  );
}

export function EtsyIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 4.2c-.4 0-.6.2-.6.6v14.4c0 .4.2.6.6.6h7.6c.3 0 .5-.1.6-.4l1.1-3.1c.1-.3-.1-.6-.4-.6h-.6c-.2 0-.4.1-.5.3-.5 1.1-.9 1.6-2.1 1.6h-2.7c-.5 0-.7-.2-.7-.7v-4.6h2.6c.6 0 1 .2 1.2 1.1.1.2.2.4.5.4h.5c.3 0 .5-.2.5-.5V9.9c0-.3-.2-.5-.5-.5h-.5c-.3 0-.4.1-.5.4-.2.8-.6 1-1.2 1h-2.6V6.4c0-.5.2-.6.7-.6h2.6c1.1 0 1.5.4 1.9 1.4.1.2.3.3.5.3h.6c.3 0 .5-.3.4-.6L15.9 4.6c-.1-.3-.3-.4-.6-.4H7.5z" />
    </svg>
  );
}

export function EmailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

export const SOCIAL_LINKS = [
  { id: "social-twitter", label: "Twitter / X", Icon: TwitterIcon },
  { id: "social-instagram", label: "Instagram", Icon: InstagramIcon },
  { id: "social-facebook", label: "Facebook", Icon: FacebookIcon },
  { id: "social-youtube", label: "YouTube", Icon: YouTubeIcon },
  { id: "social-tiktok", label: "TikTok", Icon: TikTokIcon },
];
