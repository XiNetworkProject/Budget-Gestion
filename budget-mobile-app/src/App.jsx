import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "./store";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { PlusIcon, CrossIcon, TableIcon, ChartIcon } from "./icons";
import Login from "./components/Login";
import Budget from "./components/Budget";
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
  const { months, categories, data, setValue, addCategory, removeCategory, addMonth, removeMonth, incomeTypes, incomes, setIncome, addIncomeType, removeIncomeType, renameIncomeType, renameCategory, sideByMonth, setSideByMonth, renameMonth } = useStore();
  
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
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  // Ajouter un écouteur pour la rotation de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className={`tableau ${isCompact ? 'compact' : ''}`} style={{
      overflowX: 'auto',
      background: '#1a202c',
      borderRadius: '8px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      WebkitScrollbar: {
        display: 'none'
      },
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      willChange: 'transform',
      width: '100%',
      margin: '0 auto',
      padding: '0.5rem',
      position: 'relative'
    }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tableau de bord</h2>
        <button
          onClick={() => setIsCompact(!isCompact)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isCompact ? 'Mode Normal' : 'Mode Compact'}
        </button>
      </div>

      {/* Navigation par mois */}
      <div className="flex justify-center items-center mb-4 space-x-2">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setCurrentMonthIndex(index)}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currentMonthIndex === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Contenu du tableau */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-gray-800 text-left p-2">Catégorie</th>
              {months.map(m => (
                <th key={m} className="text-center p-2">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category, catIndex) => (
              <tr key={category} className="border-t border-gray-700">
                <td className="sticky left-0 z-10 bg-gray-800 p-2">
                  {editCatIdx === catIndex ? (
                    <input
                      type="text"
                      value={catEditValue}
                      onChange={(e) => setCatEditValue(e.target.value)}
                      onBlur={() => {
                        if (catEditValue.trim()) {
                          renameCategory(catIndex, catEditValue.trim());
                        }
                        setEditCatIdx(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (catEditValue.trim()) {
                            renameCategory(catIndex, catEditValue.trim());
                          }
                          setEditCatIdx(null);
                        }
                      }}
                      className="w-full bg-gray-700 text-white p-1 rounded"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between group">
                      <span>{category}</span>
                      <button
                        onClick={() => {
                          setEditCatIdx(catIndex);
                          setCatEditValue(category);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-300 ml-2"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </td>
                {months.map(m => (
                  <td key={m} className="text-center p-2">
                    {editCell.row === catIndex && editCell.col === months.indexOf(m) ? (
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={() => {
                          if (inputValue !== "") {
                            setValue(catIndex, months.indexOf(m), parseFloat(inputValue));
                          }
                          setEditCell({ row: null, col: null });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (inputValue !== "") {
                              setValue(catIndex, months.indexOf(m), parseFloat(inputValue));
                            }
                            setEditCell({ row: null, col: null });
                          }
                        }}
                        className="w-full bg-gray-700 text-white p-1 rounded text-center"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => {
                          setEditCell({ row: catIndex, col: months.indexOf(m) });
                          setInputValue(data[catIndex]?.[months.indexOf(m)]?.toString() || "");
                        }}
                        className="cursor-pointer hover:bg-gray-700 p-1 rounded"
                      >
                        {data[catIndex]?.[months.indexOf(m)] || 0}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  const [page, setPage] = useState("tableau");
  const { isAuthenticated, user, logout } = useStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div style={{
      background: '#1a202c',
      minHeight: '100vh',
      color: '#e2e8f0',
      paddingBottom: '72px' // Espace pour la barre de navigation
    }}>
      <header style={{
        background: '#2d3748',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          color: '#e2e8f0',
        }}>Budget Manager</h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {user?.picture && (
            <img 
              src={user.picture} 
              alt={user.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%'
              }}
            />
          )}
          <span style={{ color: '#e2e8f0' }}>{user?.name}</span>
          <button
            onClick={logout}
            style={{
              background: '#4a5568',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{
        padding: '16px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        {page === "tableau" ? <TableView /> : <Visualisation />}
      </main>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#2d3748',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '56px',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <button 
          style={{
            background: 'transparent',
            border: 'none',
            color: page === 'tableau' ? '#4299e1' : '#a0aec0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            minHeight: '48px',
            minWidth: '48px'
          }} 
          onClick={() => setPage("tableau")}
        >
          <TableIcon />
          <span style={{fontSize: '12px'}}>Tableau</span>
        </button>
        <button 
          style={{
            background: 'transparent',
            border: 'none',
            color: page === 'visu' ? '#4299e1' : '#a0aec0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            minHeight: '48px',
            minWidth: '48px'
          }} 
          onClick={() => setPage("visu")}
        >
          <ChartIcon />
          <span style={{fontSize: '12px'}}>Visualisation</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
