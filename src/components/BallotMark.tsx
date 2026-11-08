interface BallotMarkProps {
  tone?: 'gold' | 'navy';
}

export default function BallotMark({ tone = 'gold' }: BallotMarkProps) {
  return (
    <span
      className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] text-[10px] font-black leading-none ${
        tone === 'navy'
          ? 'bg-navy-900 text-gold-300'
          : 'bg-gold-400 text-navy-950'
      }`}
      title="Nomor urut 4"
    >
      4
    </span>
  );
}
