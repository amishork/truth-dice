const GradientBlobs = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div
      className="absolute -left-32 -top-32 h-[500px] w-[500px] animate-[float_8s_ease-in-out_infinite] rounded-full opacity-[0.04]"
      style={{ background: "radial-gradient(circle, hsl(350 78% 50%), transparent 70%)" }}
    />
    <div
      className="absolute -bottom-48 -right-48 h-[600px] w-[600px] animate-[float_10s_ease-in-out_infinite_2s] rounded-full opacity-[0.03]"
      style={{ background: "radial-gradient(circle, hsl(20 80% 50%), transparent 70%)" }}
    />
    <div
      className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 animate-[float_12s_ease-in-out_infinite_4s] rounded-full opacity-[0.03]"
      style={{ background: "radial-gradient(circle, hsl(350 60% 40%), transparent 70%)" }}
    />
  </div>
);

export default GradientBlobs;
