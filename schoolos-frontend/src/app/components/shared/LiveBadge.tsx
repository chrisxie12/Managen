export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      LIVE
    </span>
  );
}
