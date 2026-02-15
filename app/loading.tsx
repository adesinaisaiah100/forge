export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-white">
        <video
          src="/loadingvideo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
