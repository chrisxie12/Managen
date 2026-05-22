import { getInitials } from '../../utils/formatters';

interface AvatarInitialsProps {
  name: string;
  color: string;
  size?: number;
}

export function AvatarInitials({ name, color, size = 36 }: AvatarInitialsProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
}
