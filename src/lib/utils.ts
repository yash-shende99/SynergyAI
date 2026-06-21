import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleLogoError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.target as HTMLImageElement;
  if (target.src.includes('logo.uplead.com') || target.src.includes('logo.clearbit.com')) {
    const domain = target.src.split('/').pop();
    if (domain && domain.includes('.')) {
      target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      return;
    }
  }
  if (!target.src.includes('placeholder-logo.svg')) {
    target.src = '/placeholder-logo.svg';
  }
}
