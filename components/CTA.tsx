export default function CTA() {
  return (
    <section className="px-6 pb-28">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-cyan-500/20 p-12 text-center backdrop-blur-2xl">
        <h2 className="text-4xl font-black md:text-6xl">
          Your college journey starts here.
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300">
          Meet friends before classes begin, discover opportunities, earn
          money, and make every semester unforgettable.
        </p>

        <button className="mt-10 rounded-full bg-white px-10 py-4 text-lg font-bold text-black transition hover:scale-105">
          Join Universe Today
        </button>
      </div>
    </section>
  );
}