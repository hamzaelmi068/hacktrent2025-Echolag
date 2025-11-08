interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-base text-gray-600">{subtitle}</p>
      ) : null}
    </div>
  );
};

export default SectionHeading;

