"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useFinanceStore } from '@/lib/store';
import { formatLocalDate } from '@/lib/date-utils';

export function SpendingChart() {
  const { transactions } = useFinanceStore();

  // Generate last 7 days labels and initial data
  const getLast7Days = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        name: days[date.getDay()],
        fullDate: formatLocalDate(date),
        amount: 0
      });
    }
    return result;
  };

  const chartData = getLast7Days();

  // Populate with real transaction data
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      const dayData = chartData.find(d => tx.date?.startsWith(d.fullDate));
      if (dayData) {
        dayData.amount += tx.amount;
      }
    }
  });

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-card rounded-[2.5rem] p-8 h-[450px] shadow-xl border border-border/50 bg-white/50 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">Spending Overview</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Live Analytics for {currentMonth}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time Data</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <Tooltip 
              cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.name}</p>
                      <p className="text-lg font-black text-primary">₱{payload[0].value?.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#6366f1" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              animationDuration={2000}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1', className: "shadow-lg" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
