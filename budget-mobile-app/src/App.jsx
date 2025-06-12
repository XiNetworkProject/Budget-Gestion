import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "./store";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { PlusIcon, CrossIcon, TableIcon, ChartIcon } from "./icons";
import Login from "./components/Login";
import Budget from "./components/Budget";
import { useSwipeable } from 'react-swipeable';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FixedSizeList as List } from 'react-window';
import Joyride, { STATUS } from 'react-joyride';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Ajouter les styles d'animation et de contraste
const styles = {
  card: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15), 0 3px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  },
  button: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    ':hover': {
      background: '#1d4ed8',
      transform: 'scale(1.02)'
    },
    ':active': {
      transform: 'scale(0.98)'
    }
  },
  input: {
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: '6px',
    padding: '8px 12px',
    color: 'white',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
      outline: 'none'
    }
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    'th, td': {
      padding: '12px',
      textAlign: 'left',
      borderBottom: '1px solid #334155',
      transition: 'background-color 0.2s ease'
    },
    'th': {
      background: '#1e293b',
      color: '#e2e8f0',
      fontWeight: '600'
    },
    'td': {
      background: '#0f172a',
      color: '#f8fafc'
    },
    'tr:hover td': {
      background: '#1e293b'
    }
  },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#1e293b',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '56px',
    boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    transition: 'transform 0.3s ease'
  },
  navButton: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'color 0.2s ease, transform 0.2s ease',
    ':hover': {
      color: '#e2e8f0',
      transform: 'translateY(-2px)'
    }
  },
  activeNavButton: {
    color: '#3b82f6',
    transform: 'translateY(-2px)'
  }
};

function getCellColor(val) {
  if (val === 0) return '#2d3748';
  if (val < 0) return '#e53e3e';
  return '#38a169';
}
function getEcoColor(val) {
  if (val > 0) return "bg-gradient-to-br from-green-500 to-green-700 text-white";
  if (val < 0) return "bg-gradient-to-br from-red-500 to-red-700 text-white";
  return "bg-slate-700 text-white";
}
function parseOperation(input, current) {
  if (/^[-+*/]/.test(input)) {
    try {
      // eslint-disable-next-line no-eval
      return eval(`${current}${input}`);
    } catch {
      return current;
    }
  }
  const num = Number(input);
  return isNaN(num) ? current : num;
}

function PieChartDépenses({ months, categories, data, moisIdx }) {
  const values = categories.map(cat => data[cat]?.[moisIdx] || 0);
  return (
    <div className="h-40 w-full flex items-center justify-center">
      <Pie
        data={{
          labels: categories,
          datasets: [{
            data: values,
            backgroundColor: [
              '#22c55e', '#f59e42', '#ef4444', '#6366f1', '#eab308', '#06b6d4', '#a21caf', '#f472b6', '#64748b', '#84cc16'
            ],
          }],
        }}
        options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
        height={160}
        width={160}
      />
    </div>
  );
}
function BarChartEconomies({ months, economies }) {
  return (
    <div className="h-40 w-full flex items-center justify-center">
      <Bar
        data={{
          labels: months,
          datasets: [{
            label: 'Économies',
            data: economies,
            backgroundColor: economies.map(e => e > 0 ? '#22c55e' : e < 0 ? '#ef4444' : '#64748b'),
          }],
        }}
        options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
        height={160}
        width={160}
      />
    </div>
  );
}

function BadgeEco({ value }) {
  let bg = '#22c55e';
  if (value < 0) bg = '#ef4444';
  if (value === 0) bg = '#64748b';
  return <span style={{background:bg,color:'#fff',borderRadius:12,padding:'0.2em 0.8em',fontWeight:600,marginLeft:8,transition:'background 0.3s'}}>{value} €</span>;
}

function TableView({ isCompact, setIsCompact }) {
  const { months, categories, data, setValue, addCategory, removeCategory, addMonth, removeMonth, incomeTypes, incomes, setIncome, addIncomeType, removeIncomeType, renameIncomeType, renameCategory, sideByMonth, setSideByMonth, renameMonth, reorderCategories, reorderIncomeTypes, isLoading } = useStore();
  
  // Optimisation des états avec useMemo
  const [editCell, setEditCell] = useState({ row: null, col: null });
  const [inputValue, setInputValue] = useState("");
  const [editIncomeCell, setEditIncomeCell] = useState({ row: null, col: null });
  const [incomeInputValue, setIncomeInputValue] = useState("");
  const [editCatIdx, setEditCatIdx] = useState(null);
  const [catEditValue, setCatEditValue] = useState("");
  const [editIncomeIdx, setEditIncomeIdx] = useState(null);
  const [incomeEditValue, setIncomeEditValue] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [addingIncome, setAddingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState('');
  const [addingMonth, setAddingMonth] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Ajouter un écouteur pour la rotation de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation clavier (← →)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setCurrentMonthIndex(i => Math.max(i - 1, 0));
      if (e.key === 'ArrowRight') setCurrentMonthIndex(i => Math.min(i + 1, months.length - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [months]);
  
  // Synchroniser le mois sélectionné avec l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const moisParam = params.get('mois');
    if (moisParam) {
      const idx = months.indexOf(moisParam);
      if (idx >= 0) setCurrentMonthIndex(idx);
    }
  }, [months]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('mois', months[currentMonthIndex] || '');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [currentMonthIndex, months]);
  
  // Swipeable pour vue paysage/portrait
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentMonthIndex(i => Math.min(i + 1, months.length - 1)),
    onSwipedRight: () => setCurrentMonthIndex(i => Math.max(i - 1, 0)),
    trackMouse: true
  });

  // Nouvelle fonction pour gérer le drag & drop
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.droppableId === 'categories') {
      reorderCategories(result.source.index, result.destination.index);
    }
    if (result.source.droppableId === 'incomeTypes') {
      reorderIncomeTypes(result.source.index, result.destination.index);
    }
  };

  // Fonction pour gérer le swipe
  const handleSwipe = (direction) => {
    if (direction === 'left' && currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex(prev => prev + 1);
    } else if (direction === 'right' && currentMonthIndex > 0) {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const resetMonths = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser les mois ? Cette action supprimera toutes les données existantes.')) {
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('fr-FR', { month: 'long' });
    
    // Ajouter le mois en cours
    addMonth(currentMonth);
    
    // Ajouter les 5 mois précédents
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      addMonth(monthName);
    }
  };

  // Remplacer useMemo par une fonction normale
  const getNextMonth = () => {
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const lastMonth = months[months.length - 1];
    const lastMonthIndex = mois.indexOf(lastMonth);
    return mois[(lastMonthIndex + 1) % 12];
  };

  // Optimisation des calculs de totaux
  const totalRevenus = useMemo(() => 
    months.map((_, i) => incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[i] || 0), 0)),
    [months, incomeTypes, incomes]
  );

  const economies = useMemo(() => 
    months.map((_, i) => {
      const totalDep = categories.reduce((acc, cat) => acc + (data[cat]?.[i] || 0), 0);
      return totalRevenus[i] - totalDep;
    }),
    [months, categories, data, totalRevenus]
  );

  // Calculs
  const moisActuel = months[new Date().getMonth() % months.length] || months[0];
  const idxMois = months.indexOf(moisActuel);
  const ecoMois = economies[idxMois] || 0;
  const side = sideByMonth[idxMois] || 0;
  const reste = Math.max(ecoMois - side, 0);

  const potentielMiseDeCoteTotal = sideByMonth.reduce((acc, val) => acc + val, 0);

  // Placeholder skeleton pendant le chargement initial
  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton height={40} count={5} style={{ marginBottom: '8px' }} />
        <Skeleton height={200} />
      </div>
    );
  }

  // Vue portrait : n'affiche qu'un seul mois
  if (!isLandscape) {
    return (
      <div className="p-4">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
          {months.map((month, idx) => (
            <button key={month}
              onClick={() => setCurrentMonthIndex(idx)}
              style={{
                background: idx === currentMonthIndex ? '#4299e1' : '#4a5568',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {month}
            </button>
          ))}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ background: '#2d3748', color: '#e2e8f0', padding: '8px', textAlign: 'left' }}>Catégorie</th>
              <th style={{ background: '#2d3748', color: '#e2e8f0', padding: '8px', textAlign: 'center' }}>{months[currentMonthIndex]}</th>
            </tr>
          </thead>
          <List
            height={Math.min(categories.length * 50, 400)}
            itemCount={categories.length}
            itemSize={50}
            width="100%"
            outerElementType="tbody"
          >
            {({ index, style }) => {
              const cat = categories[index];
              return (
                <tr key={cat} style={style}>
                  <td style={{ background: '#2d3748', color: '#e2e8f0', padding: '8px' }}>{cat}</td>
                  <td style={{ background: '#1a202c', color: '#e2e8f0', padding: '8px', textAlign: 'center' }}>
                    {data[cat]?.[currentMonthIndex]?.toLocaleString() || '0'} €
                  </td>
                </tr>
              );
            }}
          </List>
        </table>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div {...(isLandscape ? swipeHandlers : {})} className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tableau de bord</h2>
          {months.length === 0 && (
            <button
              onClick={resetMonths}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Réinitialiser les mois
            </button>
          )}
        </div>
        <div style={{
          background: '#2d3748',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#e2e8f0',
              fontSize: '20px',
              fontWeight: '500',
              margin: 0
            }}>Tableau de Budget</h2>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {!addingCat ? (
                <button
                  onClick={() => setAddingCat(true)}
                  style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    border: '1px solid #4a5568',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <PlusIcon />
                  Ajouter Catégorie
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCategory.trim()) {
                        addCategory(newCategory.trim());
                        setNewCategory('');
                        setAddingCat(false);
                      }
                    }}
                    placeholder="Nouvelle catégorie"
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      width: '200px'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newCategory.trim()) {
                        addCategory(newCategory.trim());
                        setNewCategory('');
                        setAddingCat(false);
                      }
                    }}
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => {
                      setNewCategory('');
                      setAddingCat(false);
                    }}
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              )}

              {!addingIncome ? (
                <button
                  onClick={() => setAddingIncome(true)}
                  style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    border: '1px solid #4a5568',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <PlusIcon />
                  Ajouter Revenu
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={newIncome}
                    onChange={(e) => setNewIncome(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newIncome.trim()) {
                        addIncomeType(newIncome.trim());
                        setNewIncome('');
                        setAddingIncome(false);
                      }
                    }}
                    placeholder="Nouveau revenu"
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      width: '200px'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newIncome.trim()) {
                        addIncomeType(newIncome.trim());
                        setNewIncome('');
                        setAddingIncome(false);
                      }
                    }}
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => {
                      setNewIncome('');
                      setAddingIncome(false);
                    }}
                    style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{
            overflowX: isLandscape ? 'auto' : 'visible',
            background: '#1a202c',
            borderRadius: '8px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
            willChange: 'transform',
            width: '100%',
            margin: '0 auto',
            padding: '0.5rem',
            position: 'relative'
          }}>
            {/* Indicateurs de navigation */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 8px',
              pointerEvents: 'none',
              zIndex: 5
            }}>
              {currentMonthIndex > 0 && (
                <div style={{
                  background: 'rgba(45, 55, 72, 0.8)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }} onClick={() => handleSwipe('right')}>
                  ←
                </div>
              )}
              {currentMonthIndex < months.length - 1 && (
                <div style={{
                  background: 'rgba(45, 55, 72, 0.8)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }} onClick={() => handleSwipe('left')}>
                  →
                </div>
              )}
            </div>

            {/* Indicateurs de mois */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4px',
              marginBottom: '8px',
              overflowX: 'auto',
              padding: '4px 0'
            }}>
              {months.map((month, idx) => (
                <div
                  key={month}
                  style={{
                    background: idx === currentMonthIndex ? '#4299e1' : '#4a5568',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentMonthIndex(idx)}
                >
                  {month}
                </div>
              ))}
            </div>

            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: 'auto',
              fontSize: '14px',
              tableLayout: 'fixed',
              transform: isLandscape ? 'none' : `translateX(-${currentMonthIndex * 100}%)`,
              transition: 'transform 0.3s ease'
            }}>
              <thead>
                <tr>
                  <th style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '8px 4px',
                    textAlign: 'left',
                    fontWeight: '500',
                    borderBottom: '2px solid #4a5568',
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    width: '30%'
                  }}>Catégories</th>
                  {months.map((month, idx) => (
                    <th key={month} style={{
                      background: '#2d3748',
                      color: '#e2e8f0',
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontWeight: '500',
                      borderBottom: '2px solid #4a5568',
                      minWidth: '70px',
                      width: `${70 / months.length}%`
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '12px' }}>{month}</span>
                          {idx === months.length - 1 && (
                            <button
                              onClick={() => removeMonth(month)}
                              aria-label={`Supprimer le mois ${month}`}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f56565',
                                cursor: 'pointer',
                                padding: '2px',
                                opacity: '0.7',
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                              <CrossIcon />
                            </button>
                          )}
                        </div>
                        {idx === months.length - 1 && (
                          <button
                            onClick={() => addMonth(getNextMonth())}
                            aria-label="Ajouter un nouveau mois"
                            style={{
                              background: '#4a5568',
                              border: 'none',
                              color: '#e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <PlusIcon /> +
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Section Revenus */}
                <Droppable droppableId="incomeTypes">
                  {(provided) => (
                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                      <tr>
                        <td colSpan={months.length + 1} style={{
                          background: '#2d3748',
                          color: '#e2e8f0',
                          padding: '8px 16px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid #4a5568'
                        }}>
                          Revenus
                        </td>
                      </tr>
                      {incomeTypes.map((type, idx) => (
                        <Draggable key={type} draggableId={type} index={idx}>
                          {(provided2) => (
                            <tr ref={provided2.innerRef} {...provided2.draggableProps} {...provided2.dragHandleProps} key={type}>
                              <td style={{
                                background: '#2d3748',
                                color: '#e2e8f0',
                                padding: '12px 16px',
                                borderBottom: '1px solid #4a5568',
                                position: 'sticky',
                                left: 0,
                                zIndex: 5,
                                borderLeft: '4px solid #48bb78'
                              }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                  {editIncomeIdx === idx ? (
                                    <input
                                      type="text"
                                      value={incomeEditValue}
                                      onChange={(e) => setIncomeEditValue(e.target.value)}
                                      onBlur={() => {
                                        if (incomeEditValue.trim()) {
                                          renameIncomeType(type, incomeEditValue);
                                        }
                                        setEditIncomeIdx(null);
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && incomeEditValue.trim()) {
                                          renameIncomeType(type, incomeEditValue);
                                          setEditIncomeIdx(null);
                                        }
                                      }}
                                      style={{
                                        background: '#4a5568',
                                        border: '1px solid #2d3748',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        color: '#e2e8f0',
                                        width: '120px'
                                      }}
                                    />
                                  ) : (
                                    <span onClick={() => {
                                      setEditIncomeIdx(idx);
                                      setIncomeEditValue(type);
                                    }} style={{cursor: 'pointer'}}>{type}</span>
                                  )}
                                  <button
                                    onClick={() => removeIncomeType(type)}
                                    aria-label={`Supprimer le type de revenu ${type}`}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#f56565',
                                      cursor: 'pointer',
                                      padding: '4px'
                                    }}
                                  >
                                    <CrossIcon />
                                  </button>
                                </div>
                              </td>
                              {months.map((_, i) => (
                                <td key={i} style={{
                                  background: '#1a202c',
                                  color: '#e2e8f0',
                                  padding: '12px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #4a5568'
                                }}>
                                  {editIncomeCell.row === idx && editIncomeCell.col === i ? (
                                    <input
                                      type="number"
                                      value={incomeInputValue}
                                      onChange={(e) => setIncomeInputValue(e.target.value)}
                                      onBlur={() => {
                                        const val = parseFloat(incomeInputValue);
                                        if (!isNaN(val)) {
                                          setIncome(type, i, val);
                                        }
                                        setEditIncomeCell({ row: null, col: null });
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseFloat(incomeInputValue);
                                          if (!isNaN(val)) {
                                            setIncome(type, i, val);
                                          }
                                          setEditIncomeCell({ row: null, col: null });
                                        }
                                      }}
                                      style={{
                                        background: '#4a5568',
                                        border: '1px solid #2d3748',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        color: '#e2e8f0',
                                        width: '80px',
                                        textAlign: 'center'
                                      }}
                                    />
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditIncomeCell({ row: idx, col: i });
                                        setIncomeInputValue(incomes[type]?.[i] || '');
                                      }}
                                      style={{
                                        cursor: 'pointer',
                                        color: incomes[type]?.[i] ? '#48bb78' : '#a0aec0'
                                      }}
                                    >
                                      {incomes[type]?.[i]?.toLocaleString() || '0'} €
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                    </tbody>
                  )}
                </Droppable>

                {/* Section Dépenses */}
                <tr>
                  <td colSpan={months.length + 1} style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '8px 16px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #4a5568'
                  }}>
                    Dépenses
                  </td>
                </tr>
                <Droppable droppableId="categories">
                  {(provided) => (
                    <>
                      {categories.map((cat, idx) => (
                        <Draggable key={cat} draggableId={cat} index={idx}>
                          {(provided2) => (
                            <tr ref={provided2.innerRef} {...provided2.draggableProps} {...provided2.dragHandleProps} key={cat}>
                              <td style={{
                                background: '#2d3748',
                                color: '#e2e8f0',
                                padding: '12px 16px',
                                borderBottom: '1px solid #4a5568',
                                position: 'sticky',
                                left: 0,
                                zIndex: 5,
                                borderLeft: '4px solid #f56565'
                              }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                  {editCatIdx === idx ? (
                                    <input
                                      type="text"
                                      value={catEditValue}
                                      onChange={(e) => setCatEditValue(e.target.value)}
                                      onBlur={() => {
                                        if (catEditValue.trim()) {
                                          renameCategory(cat, catEditValue);
                                        }
                                        setEditCatIdx(null);
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && catEditValue.trim()) {
                                          renameCategory(cat, catEditValue);
                                          setEditCatIdx(null);
                                        }
                                      }}
                                      style={{
                                        background: '#4a5568',
                                        border: '1px solid #2d3748',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        color: '#e2e8f0',
                                        width: '120px'
                                      }}
                                    />
                                  ) : (
                                    <span onClick={() => {
                                      setEditCatIdx(idx);
                                      setCatEditValue(cat);
                                    }} style={{cursor: 'pointer'}}>{cat}</span>
                                  )}
                                  <button
                                    onClick={() => removeCategory(cat)}
                                    aria-label={`Supprimer la catégorie ${cat}`}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#f56565',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      opacity: '0.7',
                                      transition: 'opacity 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                  >
                                    <CrossIcon />
                                  </button>
                                </div>
                              </td>
                              {months.map((_, i) => (
                                <td key={i} style={{
                                  background: '#1a202c',
                                  color: '#e2e8f0',
                                  padding: '12px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #4a5568'
                                }}>
                                  {editCell.row === idx && editCell.col === i ? (
                                    <input
                                      type="number"
                                      value={inputValue}
                                      onChange={(e) => setInputValue(e.target.value)}
                                      onBlur={() => {
                                        const val = parseFloat(inputValue);
                                        if (!isNaN(val)) {
                                          setValue(cat, i, val);
                                        }
                                        setEditCell({ row: null, col: null });
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseFloat(inputValue);
                                          if (!isNaN(val)) {
                                            setValue(cat, i, val);
                                          }
                                          setEditCell({ row: null, col: null });
                                        }
                                      }}
                                      style={{
                                        background: '#4a5568',
                                        border: '1px solid #2d3748',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        color: '#e2e8f0',
                                        width: '80px',
                                        textAlign: 'center',
                                        WebkitAppearance: 'none',
                                        appearance: 'none',
                                        fontSize: '16px',
                                        minHeight: '48px'
                                      }}
                                    />
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditCell({ row: idx, col: i });
                                        setInputValue(data[cat]?.[i] || '');
                                      }}
                                      style={{
                                        cursor: 'pointer',
                                        color: getCellColor(data[cat]?.[i] || 0)
                                      }}
                                    >
                                      {data[cat]?.[i]?.toLocaleString() || '0'} €
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                    </>
                  )}
                </Droppable>

                {/* Titre Section Économies */}
                <tr>
                  <td colSpan={months.length + 1} style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '8px 16px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #4a5568'
                  }}>
                    Économies
                  </td>
                </tr>

                {/* Section Économies */}
                <tr>
                  <td style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '12px 16px',
                    borderBottom: '1px solid #4a5568',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5,
                    fontWeight: '500',
                    borderLeft: '4px solid #9f7aea'
                  }}>
                    Économies
                  </td>
                  {months.map((_, i) => {
                    const totalRev = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[i] || 0), 0);
                    const totalDep = categories.reduce((acc, cat) => acc + (data[cat]?.[i] || 0), 0);
                    const economie = totalRev - totalDep;
                    return (
                      <td key={i} style={{
                        background: '#1a202c',
                        color: '#e2e8f0',
                        padding: '12px',
                        textAlign: 'center',
                        borderBottom: '1px solid #4a5568',
                        fontWeight: '500'
                      }}>
                        <span style={{
                          color: economie >= 0 ? '#48bb78' : '#f56565',
                          fontWeight: '600'
                        }}>
                          {economie.toLocaleString()} €
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouton pour basculer le mode compact */}
        <button
          onClick={() => setIsCompact(!isCompact)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '8px 16px',
            backgroundColor: '#4a5568',
            color: '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {isCompact ? 'Mode Normal' : 'Mode Compact'}
        </button>
      </div>
    </DragDropContext>
  );
}

// Ajouter cette fonction pour calculer les variations
function calculateVariation(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Ajouter cette fonction pour l'indicateur de tendance
function TrendIndicator({ value }) {
  if (value === 0) return null;
  const color = value > 0 ? '#48bb78' : '#f56565';
  const arrow = value > 0 ? '↑' : '↓';
  return (
    <span style={{ 
      color, 
      marginLeft: '8px', 
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Visualisation() {
  const { months, categories, data, incomeTypes, incomes, sideByMonth } = useStore();
  
  // Calculs pour le mois actuel et le mois précédent
  const moisActuel = months[new Date().getMonth() % months.length] || months[0];
  const idxMois = months.indexOf(moisActuel);
  const idxMoisPrecedent = idxMois > 0 ? idxMois - 1 : months.length - 1;
  
  // Calculs des totaux pour le mois actuel
  const totalRevenus = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[idxMois] || 0), 0);
  const totalDepenses = categories.reduce((acc, cat) => acc + (data[cat]?.[idxMois] || 0), 0);
  const economie = totalRevenus - totalDepenses;
  const miseDeCote = sideByMonth[idxMois] || 0;
  const reste = Math.max(economie - miseDeCote, 0);
  
  // Calculs des totaux pour le mois précédent
  const totalRevenusPrecedent = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[idxMoisPrecedent] || 0), 0);
  const totalDepensesPrecedent = categories.reduce((acc, cat) => acc + (data[cat]?.[idxMoisPrecedent] || 0), 0);
  const economiePrecedent = totalRevenusPrecedent - totalDepensesPrecedent;
  const miseDeCotePrecedent = sideByMonth[idxMoisPrecedent] || 0;
  
  // Calcul des variations
  const variationRevenus = calculateVariation(totalRevenus, totalRevenusPrecedent);
  const variationDepenses = calculateVariation(totalDepenses, totalDepensesPrecedent);
  const variationEconomie = calculateVariation(economie, economiePrecedent);
  const variationMiseDeCote = calculateVariation(miseDeCote, miseDeCotePrecedent);
  
  // Calcul du total des mises de côté
  const potentielMiseDeCoteTotal = sideByMonth.reduce((acc, val) => acc + val, 0);

  return (
    <div style={{
      background: '#2d3748',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        color: '#e2e8f0',
        fontSize: '20px',
        fontWeight: '500',
        marginBottom: '20px',
        borderBottom: '2px solid #4a5568',
        paddingBottom: '12px'
      }}>
        Résumé du mois de {moisActuel}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #48bb78'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Revenus Totaux</h3>
          <p style={{ color: '#48bb78', fontSize: '24px', fontWeight: '600' }}>
            {totalRevenus.toLocaleString()} €
            <TrendIndicator value={variationRevenus} />
          </p>
          <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '4px' }}>
            vs {months[idxMoisPrecedent]}: {totalRevenusPrecedent.toLocaleString()} €
          </p>
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #f56565'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Dépenses Totales</h3>
          <p style={{ color: '#f56565', fontSize: '24px', fontWeight: '600' }}>
            {totalDepenses.toLocaleString()} €
            <TrendIndicator value={variationDepenses} />
          </p>
          <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '4px' }}>
            vs {months[idxMoisPrecedent]}: {totalDepensesPrecedent.toLocaleString()} €
          </p>
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #9f7aea'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Économies</h3>
          <div style={{
            background: '#1a202c',
            borderRadius: '8px',
            padding: '16px',
            borderLeft: '4px solid #48bb78'
          }}>
            <p style={{ 
              color: economie >= 0 ? '#48bb78' : '#f56565', 
              fontSize: '24px', 
              fontWeight: '600' 
            }}>
              {economie.toLocaleString()} €
              <TrendIndicator value={variationEconomie} />
            </p>
            <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '4px' }}>
              vs {months[idxMoisPrecedent]}: {economiePrecedent.toLocaleString()} €
            </p>
          </div>
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #4299e1'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Mise de côté</h3>
          <p style={{ color: '#4299e1', fontSize: '24px', fontWeight: '600' }}>
            {miseDeCote.toLocaleString()} €
            <TrendIndicator value={variationMiseDeCote} />
          </p>
          <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '4px' }}>
            vs {months[idxMoisPrecedent]}: {miseDeCotePrecedent.toLocaleString()} €
          </p>
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #ed8936'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Reste à partager</h3>
          <p style={{ color: '#ed8936', fontSize: '24px', fontWeight: '600' }}>{reste.toLocaleString()} €</p>
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: '4px solid #38b2ac'
        }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Potentiel total de mise de côté</h3>
          <p style={{ color: '#38b2ac', fontSize: '24px', fontWeight: '600' }}>{potentielMiseDeCoteTotal.toLocaleString()} €</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '32px'
      }}>
        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ 
            color: '#e2e8f0', 
            marginBottom: '16px', 
            fontSize: '16px', 
            textTransform: 'uppercase',
            borderBottom: '1px solid #4a5568',
            paddingBottom: '8px'
          }}>
            Répartition des dépenses
          </h3>
          <PieChartDépenses months={months} categories={categories} data={data} moisIdx={idxMois} />
        </div>

        <div style={{
          background: '#1a202c',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ 
            color: '#e2e8f0', 
            marginBottom: '16px', 
            fontSize: '16px', 
            textTransform: 'uppercase',
            borderBottom: '1px solid #4a5568',
            paddingBottom: '8px'
          }}>
            Évolution des économies
          </h3>
          <BarChartEconomies 
            months={months} 
            economies={months.map((_, i) => {
              const totalRev = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[i] || 0), 0);
              const totalDep = categories.reduce((acc, cat) => acc + (data[cat]?.[i] || 0), 0);
              return totalRev - totalDep;
            })} 
          />
        </div>
      </div>
    </div>
  );
}

const App = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState("tableau");
  const { isAuthenticated, user, logout, isSaving, isLoading } = useStore();
  const [isCompact, setIsCompact] = useState(false);
  // Theme (dark/light)
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  // Tour guidé onboarding
  const [runTour, setRunTour] = useState(false);
  const tourSteps = [
    { target: 'header h1', content: t('app.title') },
    { target: 'button[aria-label="Ajouter un nouveau mois"]', content: 'Ajoute un mois' },
    { target: '.p-4 table', content: 'Voici le tableau de gestion des dépenses' },
    { target: '.nav button:first-child', content: 'Accède au tableau' },
    { target: '.nav button:last-child', content: 'Accède aux visualisations' },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Hooks Joyride toujours appelés avant le guard auth
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  // Barre de chargement top
  useEffect(() => {
    if (isLoading || isSaving) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading, isSaving]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{ options: { zIndex: 2000 } }}
      />
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#e2e8f0',
        paddingBottom: '72px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{t('app.title')}</h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #94a3b8',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                {theme === 'dark' ? t('theme.light') : t('theme.dark')}
              </button>
              <span style={{ color: '#94a3b8' }}>{user?.email}</span>
              <button
                onClick={logout}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {t('logout')}
              </button>
            </div>
          </header>

          {isSaving && (
            <div role="status" aria-live="polite" aria-busy="true" style={{
              backgroundColor: '#2563eb',
              color: 'white',
              textAlign: 'center',
              padding: '4px 0',
              fontSize: '0.9rem',
              marginBottom: '16px',
              borderRadius: '4px'
            }}>
              Enregistrement en cours...
            </div>
          )}

          <main>
            {page === "tableau" ? (
              <TableView isCompact={isCompact} setIsCompact={setIsCompact} />
            ) : (
              <Visualisation />
            )}
          </main>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setPage("tableau")}
            style={{
              ...styles.navButton,
              ...(page === "tableau" ? styles.activeNavButton : {})
            }}
          >
            <TableIcon />
            <span>{t('nav.table')}</span>
          </button>
          <button
            onClick={() => setPage("visualisation")}
            style={{
              ...styles.navButton,
              ...(page === "visualisation" ? styles.activeNavButton : {})
            }}
          >
            <ChartIcon />
            <span>{t('nav.chart')}</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default App;
