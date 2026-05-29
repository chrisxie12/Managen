export const formatMoney = (amount: number, currency: string = 'GHS'): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatCurrency = formatMoney;

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', options ?? {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
};

export const timeAgo = (date: string | Date): string => {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const formatShortDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(d);
};

export const getCurrentTerm = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let term: string;
  if (month >= 0 && month <= 3) term = 'Term 1';
  else if (month >= 4 && month <= 7) term = 'Term 2';
  else term = 'Term 3';
  return `${year} - ${term}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

export const truncate = (str: string, maxLen: number): string => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
};

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  // Use HSL for better, vibrant, consistent colors (s=70%, l=50%)
  return `hsl(${h}, 70%, 50%)`;
};
