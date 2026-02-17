export default function CompareLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="h-64 w-64 md:h-80 md:w-80 overflow-hidden">
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
