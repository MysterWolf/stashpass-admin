interface Props {
  label: string;
  color?: 'teal' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple';
}

const colorMap: Record<string, string> = {
  teal:   'bg-teal/20 text-teal',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red:    'bg-red-500/20 text-red-400',
  gray:   'bg-border text-muted',
  blue:   'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
};

export default function Badge({ label, color = 'gray' }: Props) {
  return (
    <span className={`badge ${colorMap[color]}`}>{label}</span>
  );
}
