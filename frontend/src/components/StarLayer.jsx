export default function StarLayer(){
    return(
<div className="absolute inset-0 z-0 pointer-events-none">
  {Array.from({ length: 100 }).map((_, i) => (
    <div
      key={i}
      className="absolute w-[2px] h-[2px] bg-white rounded-full twinkle"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.8,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }}
    />
  ))}
</div>

    )
}