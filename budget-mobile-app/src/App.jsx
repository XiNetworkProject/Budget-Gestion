import React, { useState, useMemo } from "react";
import { useStore } from "./store";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { PlusIcon, CrossIcon, TableIcon, ChartIcon } from "./icons";
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Budget from './components/Budget';
import Archives from './components/Archives';
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

function TableView() {
  const { months, categories, data, setValue, addCategory, removeCategory, addMonth, removeMonth, incomeTypes, incomes, setIncome, addIncomeType, removeIncomeType, renameIncomeType, renameCategory, sideByMonth, setSideByMonth, placedSavingsByMonth } = useStore();
  
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
      const placedSavings = placedSavingsByMonth[i] || 0;
      return totalRevenus[i] - totalDep - placedSavings;
    }),
    [months, categories, data, totalRevenus, placedSavingsByMonth]
  );

  // Calculs
  const moisActuel = months[new Date().getMonth() % months.length] || months[0];
  const idxMois = months.indexOf(moisActuel);
  const ecoMois = economies[idxMois] || 0;
  const side = sideByMonth[idxMois] || 0;
  const placed = placedSavingsByMonth[idxMois] || 0;
  const reste = Math.max(ecoMois - side, 0);

  const potentielMiseDeCoteTotal = sideByMonth.reduce((acc, val) => acc + val, 0);
  const totalEconomiePlacee = placedSavingsByMonth.reduce((acc, val) => acc + val, 0);

  return (
      <div>
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
          overflowX: 'auto',
          background: '#1a202c',
          borderRadius: '8px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: '800px'
          }}>
            <thead>
              <tr>
                <th style={{
                  background: '#2d3748',
                  color: '#e2e8f0',
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: '500',
                  borderBottom: '2px solid #4a5568',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10
                }}>Catégories</th>
                {months.map((month, idx) => (
                  <th key={month} style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: '500',
                    borderBottom: '2px solid #4a5568',
                    minWidth: '120px'
                  }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                        {editCatIdx === idx ? (
                          <input
                            type="text"
                            value={catEditValue}
                            onChange={(e) => setCatEditValue(e.target.value)}
                            onBlur={() => {
                              if (catEditValue.trim()) {
                                const newMonths = [...months];
                                newMonths[idx] = catEditValue;
                                setMonths(newMonths);
                              }
                              setEditCatIdx(null);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && catEditValue.trim()) {
                                const newMonths = [...months];
                                newMonths[idx] = catEditValue;
                                setMonths(newMonths);
                                setEditCatIdx(null);
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
                          <span onClick={() => {
                            setEditCatIdx(idx);
                            setCatEditValue(month);
                          }} style={{cursor: 'pointer'}}>{month}</span>
                        )}
                        {idx === months.length - 1 && (
                          <button
                            onClick={() => removeMonth(idx)}
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
                        )}
                      </div>
                      {idx === months.length - 1 && (
                        <button
                          onClick={() => addMonth(getNextMonth())}
                          style={{
                            background: '#4a5568',
                            border: 'none',
                            color: '#e2e8f0',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: '0 auto'
                          }}
                        >
                          <PlusIcon /> Ajouter
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Section Revenus */}
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
                <tr key={type}>
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
              ))}

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
              {categories.map((cat, idx) => (
                <tr key={cat}>
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
                            textAlign: 'center'
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
              ))}

              {/* Ligne Économie placée */}
              <tr>
                <td style={{
                  background: '#2d3748',
                  color: '#e2e8f0',
                  padding: '12px 16px',
                  borderBottom: '1px solid #4a5568',
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  borderLeft: '4px solid #9f7aea',
                  fontWeight: '500'
                }}>
                  Économie placée
                </td>
                {months.map((_, i) => (
                  <td key={i} style={{
                    background: '#1a202c',
                    color: '#e2e8f0',
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '1px solid #4a5568'
                  }}>
                    {editCell.row === 'placed' && editCell.col === i ? (
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={() => {
                          const val = parseFloat(inputValue);
                          if (!isNaN(val)) {
                            setPlacedSavings(i, val);
                          }
                          setEditCell({ row: null, col: null });
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(inputValue);
                            if (!isNaN(val)) {
                              setPlacedSavings(i, val);
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
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditCell({ row: 'placed', col: i });
                          setInputValue(placedSavingsByMonth[i] || '');
                        }}
                        style={{
                          cursor: 'pointer',
                          color: '#9f7aea'
                        }}
                      >
                        {placedSavingsByMonth[i]?.toLocaleString() || '0'} €
                      </span>
                    )}
                  </td>
                ))}
              </tr>

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
                  const placed = placedSavingsByMonth[i] || 0;
                  const economie = totalRev - totalDep - placed;
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

              {/* Ligne Total Économies Placées */}
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
                  Total Économies Placées
                </td>
                {months.map((_, i) => {
                  const totalPlaced = placedSavingsByMonth.slice(0, i + 1).reduce((acc, val) => acc + val, 0);
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
                        color: '#9f7aea',
                        fontWeight: '600'
                      }}>
                        {totalPlaced.toLocaleString()} €
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ... rest of the code ... */}
    </div>
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
  const { months, categories, data, incomeTypes, incomes, sideByMonth, placedSavingsByMonth } = useStore();
  
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
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
          <div className="savings-section">
            <div className="savings-input">
              <label>Montant total potentiel :</label>
              <input
                type="number"
                value={useStore((state) => state.totalPotentialSavings || 0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  useStore.setState({ totalPotentialSavings: value });
                  if (useStore.getState().user) {
                    budgetService.saveBudget(useStore.getState().user.id, {
                      ...useStore.getState(),
                      totalPotentialSavings: value
                    });
                  }
                }}
                placeholder="Montant total potentiel"
              />
            </div>
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
  const [page, setPage] = useState("tableau");
  const { isAuthenticated, user, logout, checkAndArchivePreviousMonth } = useStore();

  // Vérifier l'archivage au chargement de l'application
  React.useEffect(() => {
    checkAndArchivePreviousMonth();
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <nav className="bg-slate-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Budget App</Link>
            <div className="space-x-4">
              <Link to="/" className="hover:text-blue-400">Budget</Link>
              <Link to="/archives" className="hover:text-blue-400">Archives</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<Budget />} />
            <Route path="/archives" element={<Archives />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
