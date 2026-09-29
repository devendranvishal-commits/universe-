type PageHeaderProps = {
  badge: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function PageHeader({
  badge,
  title,
  description,
  buttonText,
  onButtonClick,
}: PageHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 to-blue-700/20 p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">
        {badge}
      </p>

      <h1 className="mt-4 text-5xl font-black text-white">
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-gray-300">
        {description}
      </p>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="mt-8 rounded-full bg-white px-6 py-3 font-bold text-black transition hover:scale-105"
        >
          {buttonText}
        </button>
      )}
    </section>
  );
}