type LogoProps = {
  size?: number;
  className?: string;
};

export function Logo({ size = 28, className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="RatioLog"
      width={size}
      height={size}
      className={className}
    />
  );
}
