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
import { DragDropContext } from 'react-beautiful-dnd';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Joyride, { STATUS } from 'react-joyride';
import Splash from './components/Splash';

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

// Réimplémentation de TableView pour table statique avec édition inline et boutons ▲/▼
function TableView({ isCompact, setIsCompact }) {
  const { months, incomeTypes, incomes, categories, data, setIncome, setValue, addIncomeType, removeIncomeType, renameIncomeType, addCategory, removeCategory, renameCategory, reorderIncomeTypes, reorderCategories, addMonth, removeMonth, sideByMonth, setSideByMonth, isLoading } = useStore();
  const [highlightedCat, setHighlightedCat] = useState(null);
  const handleReorderCategories = (sourceIdx, destIdx) => {
    const catName = categories[sourceIdx];
    reorderCategories(sourceIdx, destIdx);
    setHighlightedCat(catName);
    setTimeout(() => setHighlightedCat(null), 800);
  };
  const [editIncomeCell, setEditIncomeCell] = useState({ row: null, col: null });
  const [incomeInputValue, setIncomeInputValue] = useState("");
  const [editExpenseCell, setEditExpenseCell] = useState({ row: null, col: null });
  const [expenseInputValue, setExpenseInputValue] = useState("");
  const [editIncomeIdx, setEditIncomeIdx] = useState(null);
  const [incomeEditValue, setIncomeEditValue] = useState("");
  const [editCatIdx, setEditCatIdx] = useState(null);
  const [catEditValue, setCatEditValue] = useState("");
  const [addingIncome, setAddingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingMonth, setAddingMonth] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [editSaveCell, setEditSaveCell] = useState(null);
  const [saveInputValue, setSaveInputValue] = useState("");

  const getNextMonth = () => {
    const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const last = months[months.length - 1];
    const idx = mois.indexOf(last);
    return mois[(idx + 1) % 12];
  };

  if (isLoading) {
    return <div className="p-4">Chargement…</div>;
  }

  return (
    <div className={`tableau ${isCompact ? 'compact' : ''}`}>
      <div className="flex justify-end mb-2">
        <button className="btn" onClick={() => setIsCompact(!isCompact)}>
          {isCompact ? 'Vue normale' : 'Vue compacte'}
        </button>
      </div>
      <table style={{"--columns-count": months.length}}>
        <thead>
          <tr>
            <th>Catégories & Revenus</th>
            {months.map((month, mi) => (
              <th key={month}>
                {month}
                <button className="btn delete" onClick={() => removeMonth(month)}>×</button>
              </th>
            ))}
            <th>
              {addingMonth ? (
                <input
                  type="text"
                  value={newMonth}
                  onChange={e => setNewMonth(e.target.value)}
                  onBlur={() => { if (newMonth.trim()) addMonth(newMonth.trim()); setNewMonth(''); setAddingMonth(false); }}
                  onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  autoFocus
                />
              ) : (
                <button onClick={() => { addMonth(getNextMonth()); }} className="add">+ Mois</button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={months.length + 2}>Revenus</td></tr>
          {incomeTypes.map((type, ri) => (
            <tr key={type}>
              <td>
                {editIncomeIdx === ri ? (
                  <input
                    type="text"
                    value={incomeEditValue}
                    onChange={e => setIncomeEditValue(e.target.value)}
                    onBlur={() => { if (incomeEditValue.trim()) renameIncomeType(incomeEditValue.trim(), ri); setEditIncomeIdx(null); }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    autoFocus
                  />
                ) : (
                  <>
                    <button className="btn btn-action" disabled={ri === 0} onClick={() => reorderIncomeTypes(ri, ri - 1)}>▲</button>
                    <button className="btn btn-action" disabled={ri === incomeTypes.length - 1} onClick={() => reorderIncomeTypes(ri, ri + 1)}>▼</button>
                    <span onDoubleClick={() => { setEditIncomeIdx(ri); setIncomeEditValue(type); }}>{type}</span>
                    <button onClick={() => removeIncomeType(type)} className="btn delete">×</button>
                  </>
                )}
              </td>
              {months.map((_, mi) => (
                <td key={mi} onClick={() => { setEditIncomeCell({ row: ri, col: mi }); setIncomeInputValue((incomes[type]?.[mi] || 0).toString()); }}>
                  {editIncomeCell.row === ri && editIncomeCell.col === mi ? (
                    <input
                      type="number"
                      value={incomeInputValue}
                      onChange={e => setIncomeInputValue(e.target.value)}
                      onBlur={() => { const val = parseFloat(incomeInputValue) || 0; setIncome(type, mi, val); setEditIncomeCell({ row: null, col: null }); }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    <span style={{ color: getCellColor(incomes[type]?.[mi] || 0) }}>
                      {`${incomes[type]?.[mi] || 0} €`}
                    </span>
                  )}
                </td>
              ))}
              <td>
                {ri === incomeTypes.length - 1 && (
                  addingIncome ? (
                    <input
                      type="text"
                      placeholder="Nouveau"
                      value={newIncome}
                      onChange={e => setNewIncome(e.target.value)}
                      onBlur={() => { if (newIncome.trim()) addIncomeType(newIncome.trim()); setNewIncome(''); setAddingIncome(false); }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    <button onClick={() => setAddingIncome(true)} className="add">+ Ajouter</button>
                  )
                )}
              </td>
            </tr>
          ))}
          <tr><td colSpan={months.length + 2}>Dépenses</td></tr>
          {categories.map((cat, rc) => (
            <tr key={cat} className={highlightedCat === cat ? 'highlight-row' : ''}>
              <td>
                {editCatIdx === rc ? (
                  <input
                    type="text"
                    value={catEditValue}
                    onChange={e => setCatEditValue(e.target.value)}
                    onBlur={() => { if (catEditValue.trim()) renameCategory(catEditValue.trim(), rc); setEditCatIdx(null); }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    autoFocus
                  />
                ) : (
                  <>
                    <button className="btn btn-action" disabled={rc === 0} onClick={() => handleReorderCategories(rc, rc - 1)}>▲</button>
                    <button className="btn btn-action" disabled={rc === categories.length - 1} onClick={() => handleReorderCategories(rc, rc + 1)}>▼</button>
                    <span onDoubleClick={() => { setEditCatIdx(rc); setCatEditValue(cat); }}>{cat}</span>
                    <button onClick={() => removeCategory(cat)} className="btn delete">×</button>
                  </>
                )}
              </td>
              {months.map((_, mi) => (
                <td key={mi} onClick={() => { setEditExpenseCell({ row: rc, col: mi }); setExpenseInputValue((data[cat]?.[mi] || 0).toString()); }}>
                  {editExpenseCell.row === rc && editExpenseCell.col === mi ? (
                    <input
                      type="number"
                      value={expenseInputValue}
                      onChange={e => setExpenseInputValue(e.target.value)}
                      onBlur={() => { const val = parseFloat(expenseInputValue) || 0; setValue(cat, mi, val); setEditExpenseCell({ row: null, col: null }); }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    <span style={{ color: getCellColor(-(data[cat]?.[mi] || 0)) }}>
                      {`${data[cat]?.[mi] || 0} €`}
                    </span>
                  )}
                </td>
              ))}
              <td>
                {rc === categories.length - 1 && (
                  addingCategory ? (
                    <input
                      type="text"
                      placeholder="Nouveau"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onBlur={() => { if (newCategory.trim()) addCategory(newCategory.trim()); setNewCategory(''); setAddingCategory(false); }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    <button onClick={() => setAddingCategory(true)} className="add">+ Ajouter</button>
                  )
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td>Mise de côté</td>
            {months.map((_, mi) => {
              const totalInc = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[mi] || 0), 0);
              const totalDep = categories.reduce((acc, cat) => acc + (data[cat]?.[mi] || 0), 0);
              const defaultSave = (totalInc - totalDep) / 2;
              const saved = sideByMonth[mi] != null ? sideByMonth[mi] : defaultSave;
              return (
                <td key={mi} onClick={() => { setEditSaveCell(mi); setSaveInputValue(saved.toString()); }}>
                  {editSaveCell === mi ? (
                    <input
                      type="number"
                      value={saveInputValue}
                      onChange={e => setSaveInputValue(e.target.value)}
                      onBlur={() => { const val = parseFloat(saveInputValue) || 0; setSideByMonth(mi, val); setEditSaveCell(null); }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      autoFocus
                    />
                  ) : (
                    `${saved.toLocaleString('fr-FR')} €`
                  )}
                </td>
              );
            })}
            <td></td>
          </tr>
          <tr>
            <td>Économies</td>
            {months.map((_, mi) => {
              const totalInc = incomeTypes.reduce((acc, type) => acc + (incomes[type]?.[mi] || 0), 0);
              const totalDep = categories.reduce((acc, cat) => acc + (data[cat]?.[mi] || 0), 0);
              const save = sideByMonth[mi] || 0;
              const eco = totalInc - totalDep - save;
              return (
                <td key={mi} className={getEcoColor(eco)}>
                  {eco.toLocaleString('fr-FR')} €
                </td>
              );
            })}
            <td></td>
          </tr>
        </tbody>
      </table>
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
  const { t } = useTranslation();
  // Splash screen
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);
  // App state hooks (toujours appelés)
  const [page, setPage] = useState("tableau");
  const { isAuthenticated, user, logout, isSaving, isLoading } = useStore();
  const [isCompact, setIsCompact] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
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
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };
  useEffect(() => {
    if (isLoading || isSaving) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading, isSaving]);
  // Conditional rendering après tous les hooks
  if (showSplash) return <Splash />;
  if (!isAuthenticated) return <Login />;

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
          <header className="app-header">
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{t('app.title')}</h1>
            <div className="header-controls">
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
              <img src={user?.picture} alt={user?.name} className="avatar" />
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
