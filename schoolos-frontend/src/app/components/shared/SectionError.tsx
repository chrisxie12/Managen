interface SectionErrorProps {
  section: string;
  onRetry?: () => void;
}

export function SectionError({ section, onRetry }: SectionErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[120px] bg-white rounded-lg border border-red-100">
      <div className="text-center p-4">
        <p className="text-red-500 text-sm font-medium">⚠ Could not load {section}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
