import React, { useState } from 'react';

const MoneyCartIntro = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "MONEY CART 4",
      subtitle: "Symboles de base",
      cards: [
        {
          icon: "💰",
          color: "#8B4513",
          title: "COIN",
          description: "Reveals a value between 1 and 10 coins."
        },
        {
          icon: "⚙️",
          color: "#4A5568",
          title: "BLANK",
          description: "Non winning symbol."
        }
      ]
    },
    {
      title: "MONEY CART 4",
      subtitle: "Symboles spéciaux",
      cards: [
        {
          icon: "🎯",
          color: "#E53E3E",
          title: "SNIPER",
          description: "Selects from 3 to 5 symbols as targets at the end of each spin, adds their values to its own and then pays out its updated value to each of those targets."
        },
        {
          icon: "💎",
          color: "#3182CE",
          title: "NECROMANCER",
          description: "Brings between 1 and 7 already used non persistent feature symbols to life again at the end of that spin and every spin that follows. The same symbol can be targeted several times."
        },
        {
          icon: "🔫",
          color: "#38A169",
          title: "ARMS DEALER",
          description: "Turns into one of the following features after every spin Collector, Payer, Sniper, Collector Payer, Arms Dealer or Unlocker."
        },
        {
          icon: "🎰",
          color: "#805AD5",
          title: "TRANSFORMER",
          description: "Converts 1 Symbol into a feature symbol at the end of that spin and every spin that follows. After the conversion the new feature symbol will perform its action."
        },
        {
          icon: "💵",
          color: "#D69E2E",
          title: "DOUBLER",
          description: "Doubles the values of 3 to 8 other symbols at the end of that spin and every spin that follows. It can act on the same symbol several times."
        }
      ]
    },
    {
      title: "MONEY CART 4",
      subtitle: "Symboles collecteur",
      cards: [
        {
          icon: "🔍",
          color: "#E53E3E",
          title: "COLLECTOR",
          description: "Collects all visible values on the reels and adds them to its own value at the end of that spin and every spin that follows. This symbol does not collect its own value."
        },
        {
          icon: "💸",
          color: "#3182CE",
          title: "PAYER",
          description: "Reveals a value and then adds it to all other visible symbols on the reels for that spin and every spin that follows. This symbol does not pay itself."
        },
        {
          icon: "🎯",
          color: "#E53E3E",
          title: "COLLECTOR",
          description: "Collects all the values from the 8 adjacent positions to its own value at the end of that spin and every spin that follows."
        },
        {
          icon: "💸",
          color: "#3182CE",
          title: "PAYER",
          description: "Reveals a value and then adds it to all adjacent symbols at the end of that spin and every spin that follows."
        },
        {
          icon: "⬆️",
          color: "#805AD5",
          title: "UPGRADER",
          description: "Upgrades 1 to 3 feature symbols into their Persistent version."
        }
      ]
    },
    {
      title: "MONEY CART 4",
      subtitle: "Symboles utilitaires",
      cards: [
        {
          icon: "🔄",
          color: "#E53E3E",
          title: "NECROMANCER",
          description: "Brings between 2 and 7 already used non persistent feature symbols to life again. The same symbol can be targeted several times."
        },
        {
          icon: "🎯",
          color: "#3182CE",
          title: "SNIPER",
          description: "Selects from 3 to 5 symbols as targets, adds their values to its own and then pays out its updated value to each of those targets."
        },
        {
          icon: "🔄",
          color: "#38A169",
          title: "TRANSFORMER",
          description: "Converts 1 to 4 Symbols into a feature symbol and after the conversion the new feature symbol will perform its action."
        },
        {
          icon: "+1",
          color: "#3182CE",
          title: "RESET PLUS",
          description: "Increases the reset value of the spins left count by one."
        },
        {
          icon: "🔓",
          color: "#4A5568",
          title: "UNLOCKER",
          description: "Unlocks a locked row."
        }
      ]
    },
    {
      title: "MONEY CART 4",
      subtitle: "Symboles persistants",
      cards: [
        {
          icon: "🔍",
          color: "#E53E3E",
          title: "PERSISTENT COLLECTOR",
          description: "Collects all visible values on the reels and adds them to its own value."
        },
        {
          icon: "💸",
          color: "#3182CE",
          title: "PERSISTENT PAYER",
          description: "Reveals a value and adds it to all other visible symbols on the reels."
        },
        {
          icon: "🔫",
          color: "#38A169",
          title: "PERSISTENT ARMS DEALER",
          description: "Doubles the values of 3 to 8 other symbols. It can act on the same symbol several times."
        },
        {
          icon: "🎯",
          color: "#E53E3E",
          title: "PERSISTENT COLLECTOR",
          description: "Collects all the values from the 8 adjacent positions to its own value."
        },
        {
          icon: "💸",
          color: "#3182CE",
          title: "PERSISTENT PAYER",
          description: "Reveals a value and adds its value to all adjacent symbols."
        }
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2332 50%, #0f1623 100%)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      overflow: 'auto',
      maxHeight: '100%'
    }}>
      {/* Arrière-plan avec effets */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
          linear-gradient(45deg, rgba(0,255,255,0.05) 0%, transparent 25%, transparent 75%, rgba(255,0,255,0.05) 100%)
        `,
        zIndex: 0
      }} />

      {/* Titre principal Money Cart 4 */}
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 900,
        background: 'linear-gradient(45deg, #ffd700, #ffaa00, #ff6600)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        marginBottom: '15px',
        textAlign: 'center',
        fontFamily: 'Arial Black, Arial',
        zIndex: 2,
        position: 'relative'
      }}>
        {currentSlideData.title}
      </div>

      {/* Sous-titre */}
      <div style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
        color: '#ffffff',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: 600,
        zIndex: 2,
        position: 'relative'
      }}>
        {currentSlideData.subtitle}
      </div>

      {/* Cartes des symboles */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '100%',
        width: '100%',
        marginBottom: '25px',
        zIndex: 2,
        position: 'relative',
        overflowY: 'auto'
      }}>
        {currentSlideData.cards.map((card, index) => (
          <div key={index} style={{
            background: 'linear-gradient(145deg, #1a2332, #0a0e1a)',
            border: '2px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '15px',
            width: 'clamp(180px, 22vw, 200px)',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            flex: '0 1 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
          }}>
            {/* Icône du symbole */}
            <div style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              marginBottom: '10px',
              padding: '10px',
              background: `linear-gradient(145deg, ${card.color}, ${card.color}88)`,
              borderRadius: '10px',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}>
              {card.icon}
            </div>

            {/* Nom du symbole */}
            <div style={{
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {card.title}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.3',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation par points */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        zIndex: 2,
        position: 'relative'
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentSlide ? '#ffd700' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: index === currentSlide ? '0 0 10px rgba(255, 215, 0, 0.6)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Bouton Continue */}
      <button
        onClick={nextSlide}
        style={{
          background: 'linear-gradient(145deg, #00ff88, #00cc66)',
          border: '3px solid #ffffff',
          borderRadius: '10px',
          padding: 'clamp(10px, 2vw, 15px) clamp(25px, 4vw, 35px)',
          fontSize: 'clamp(1rem, 2vw, 1.1rem)',
          fontWeight: 900,
          color: '#000000',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)',
          transition: 'all 0.15s ease',
          zIndex: 2,
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.8), inset 0 2px 4px rgba(255,255,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)';
        }}
      >
        {currentSlide === slides.length - 1 ? 'START GAME' : 'CLICK TO CONTINUE'}
      </button>
    </div>
  );
};

export default MoneyCartIntro;
