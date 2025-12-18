interface TimelineSpiralProps {
  totalMemories: number;
  activeIndex: number;
}

export function TimelineSpiral({ totalMemories, activeIndex }: TimelineSpiralProps) {
  return (
    <div className="hidden md:flex flex-col items-center w-16 lg:w-20 py-[40vh] sticky top-0 h-screen">
      {/* Spiral line */}
      <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 timeline-spiral" />
      
      {/* Timeline dots */}
      <div className="relative flex flex-col items-center justify-center gap-12 h-full">
        {Array.from({ length: totalMemories }).map((_, index) => {
          const isActive = index === activeIndex;
          const distance = Math.abs(index - activeIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.2);
          
          return (
            <div
              key={index}
              className={`
                timeline-dot transition-all duration-500
                ${isActive ? 'timeline-dot-active' : ''}
              `}
              style={{ 
                opacity,
                transform: isActive ? 'scale(1.2)' : `scale(${Math.max(0.6, 1 - distance * 0.1)})`,
              }}
            />
          );
        })}
      </div>
      
      {/* Decorative curve elements */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--timeline))" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(var(--timeline))" stopOpacity="0.5" />
            <stop offset="50%" stopColor="hsl(var(--timeline))" stopOpacity="1" />
            <stop offset="70%" stopColor="hsl(var(--timeline))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--timeline))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 40 0 Q 20 25%, 40 50% Q 60 75%, 40 100%"
          fill="none"
          stroke="url(#spiralGradient)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
