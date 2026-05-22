interface SectionEmptyProps {
  message: string;
  icon?: string;
}

export function SectionEmpty({ message, icon }: SectionEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100px] py-6 text-center">
      {icon && <span className="text-2xl mb-2">{icon}</span>}
      <p className="text-gray-400 text-sm italic">{message}</p>
    </div>
  );
}
