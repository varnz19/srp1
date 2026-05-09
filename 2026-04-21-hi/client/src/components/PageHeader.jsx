export default function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-sm uppercase tracking-[0.2em] text-ember">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl font-black leading-tight md:text-5xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-white/62">{children}</p>}
    </div>
  );
}
