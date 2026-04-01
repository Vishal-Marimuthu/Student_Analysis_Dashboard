import React, { useRef, useState } from 'react';

const Card3D = ({ children, className = '', style = {} }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
        setMousePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const handleMouseEnter = () => setIsHovered(true);

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`);
    };

    return (
        <div
            ref={cardRef}
            className={`card ${className}`}
            style={{
                ...style,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                transform,
                transformStyle: 'preserve-3d',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Dynamic Glow Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s',
                background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15), transparent 40%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div style={{ transform: 'translateZ(20px)', position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

export default Card3D;
