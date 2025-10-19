import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { Home, User, Car, Download, FileText, TrendingDown, ChevronRight } from 'lucide-react';

export function ChartVisualizationDesign() {
  const [loanType, setLoanType] = useState('home');
  const [principal, setPrincipal] = useState('5000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');
  const [showSchedule, setShowSchedule] = useState(false);

  const calculateEMI = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure) * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * parseFloat(tenure) * 12;
  const totalInterest = totalPayment - parseFloat(principal);

  const pieData = [
    { name: 'Principal', value: parseFloat(principal), color: '#3b82f6' },
    { name: 'Interest', value: totalInterest, color: '#f59e0b' },
  ];

  const generateMonthlySchedule = () => {
    const schedule = [];
    let balance = parseFloat(principal);
    const monthlyRate = parseFloat(rate) / 12 / 100;
    const months = parseFloat(tenure) * 12;

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month: i,
        emi: emi,
        principalPayment: principalPayment,
        interestPayment: interestPayment,
        balance: Math.max(0, balance),
      });

      if (balance <= 0) break;
    }
    return schedule;
  };

  const generateYearlyBreakdown = () => {
    const monthlySchedule = generateMonthlySchedule();
    const years = Math.ceil(monthlySchedule.length / 12);
    const breakdown = [];

    for (let year = 1; year <= years; year++) {
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, monthlySchedule.length);
      
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let i = startMonth; i < endMonth; i++) {
        yearlyPrincipal += monthlySchedule[i].principalPayment;
        yearlyInterest += monthlySchedule[i].interestPayment;
      }

      const balance = endMonth < monthlySchedule.length ? monthlySchedule[endMonth - 1].balance : 0;

      breakdown.push({
        year: `Y${year}`,
        Principal: Math.round(yearlyPrincipal),
        Interest: Math.round(yearlyInterest),
        Balance: Math.round(balance),
      });
    }
    return breakdown;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 10000000) return `â‚¹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `â‚¹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `â‚¹${(value / 1000).toFixed(0)}K`;
    return `â‚¹${value.toFixed(0)}`;
  };

  // Slider ranges based on loan type
  const getSliderRanges = () => {
    switch (loanType) {
      case 'home':
        return { principal: { min: 100000, max: 50000000, step: 100000 }, rate: { min: 6, max: 15, step: 0.1 }, tenure: { min: 1, max: 30, step: 1 } };
      case 'personal':
        return { principal: { min: 50000, max: 5000000, step: 50000 }, rate: { min: 10, max: 25, step: 0.1 }, tenure: { min: 1, max: 7, step: 1 } };
      case 'car':
        return { principal: { min: 100000, max: 10000000, step: 50000 }, rate: { min: 7, max: 18, step: 0.1 }, tenure: { min: 1, max: 7, step: 1 } };
      default:
        return { principal: { min: 100000, max: 50000000, step: 100000 }, rate: { min: 6, max: 15, step: 0.1 }, tenure: { min: 1, max: 30, step: 1 } };
    }
  };

  const sliderRanges = getSliderRanges();

  // Group schedule by year
  const generateYearlyScheduleGroups = () => {
    const fullSchedule = generateMonthlySchedule();
    const years: { [key: number]: typeof fullSchedule } = {};
    
    fullSchedule.forEach((month) => {
      const year = Math.ceil(month.month / 12);
      if (!years[year]) years[year] = [];
      years[year].push(month);
    });
    
    return years;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-600">
        <div className="p-6">
          <h2 className="text-gray-900 mb-1">Loan EMI Calculator with Visualization</h2>
          <p className="text-gray-600">Understand your loan with interactive charts</p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <Card>
          <div className="p-6">
            <h3 className="text-gray-900 mb-6">Loan Details</h3>
            
            {/* Loan Type Tabs */}
            <Tabs value={loanType} onValueChange={setLoanType} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="home" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="personal" className="gap-2">
                  <User className="w-4 h-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="car" className="gap-2">
                  <Car className="w-4 h-4" />
                  Car
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Input Fields with Sliders */}
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block text-gray-700">Principal Amount (â‚¹)</Label>
                <Input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="h-11 mb-2"
                  min={sliderRanges.principal.min}
                  max={sliderRanges.principal.max}
                />
                <Slider
                  value={[parseFloat(principal) || sliderRanges.principal.min]}
                  onValueChange={(values: any) => setPrincipal(values[0].toString())}
                  min={sliderRanges.principal.min}
                  max={sliderRanges.principal.max}
                  step={sliderRanges.principal.step}
                />
              </div>

              <div>
                <Label className="mb-2 block text-gray-700">Interest Rate (% per annum)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="h-11 mb-2"
                  min={sliderRanges.rate.min}
                  max={sliderRanges.rate.max}
                />
                <Slider
                  value={[parseFloat(rate) || sliderRanges.rate.min]}
                  onValueChange={(values: any) => setRate(values[0].toFixed(1))}
                  min={sliderRanges.rate.min}
                  max={sliderRanges.rate.max}
                  step={sliderRanges.rate.step}
                />
              </div>

              <div>
                <Label className="mb-2 block text-gray-700">Loan Tenure (Years)</Label>
                <Input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  className="h-11 mb-2"
                  min={sliderRanges.tenure.min}
                  max={sliderRanges.tenure.max}
                />
                <Slider
                  value={[parseFloat(tenure) || sliderRanges.tenure.min]}
                  onValueChange={(values: any) => setTenure(values[0].toString())}
                  min={sliderRanges.tenure.min}
                  max={sliderRanges.tenure.max}
                  step={sliderRanges.tenure.step}
                />
              </div>
            </div>

            {/* Key Results */}
            <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm mb-2">Your Monthly EMI</p>
              <p className="text-blue-950 text-3xl">{formatCurrency(emi)}</p>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
                <div>
                  <p className="text-blue-700 text-xs">Total Payment</p>
                  <p className="text-blue-900">{formatCurrency(totalPayment)}</p>
                </div>
                <div>
                  <p className="text-orange-700 text-xs">Total Interest</p>
                  <p className="text-orange-900">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button 
                className="flex-1 gap-2"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <FileText className="w-4 h-4" />
                {showSchedule ? 'Hide' : 'Show'} Schedule
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Column - Charts */}
        <div className="space-y-6">
          {/* Pie Chart */}
          <Card>
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Payment Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-700">Principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm text-gray-700">Interest</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Bar Chart */}
          <Card>
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Yearly Payment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generateYearlyBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={formatShortCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Principal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Interest" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Amortization Schedule Section */}
      {showSchedule && (
        <Card className="border-0 shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h3 className="text-white">Complete Amortization Analysis</h3>
            <p className="text-indigo-100">Detailed breakdown of your loan repayment schedule</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Combined Chart showing Principal + Interest + Balance */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-900">Payment Composition & Balance Over Time</h4>
                <Badge variant="outline">Yearly View</Badge>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={generateYearlyBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" tickFormatter={formatShortCurrency} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={formatShortCurrency} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Principal" stackId="payment" fill="#3b82f6" name="Principal Payment" />
                  <Bar yAxisId="left" dataKey="Interest" stackId="payment" fill="#f59e0b" name="Interest Payment" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="Balance" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    name="Outstanding Balance"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Schedule Table - Grouped by Year */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-900">Monthly Payment Schedule</h4>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{generateMonthlySchedule().length} payments</span>
                </div>
              </div>
              
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="space-y-2 p-2">
                  {Object.entries(generateYearlyScheduleGroups()).map(([yearStr, months]) => {
                    const year = parseInt(yearStr);
                    const yearTotal = months.reduce((acc, m) => acc + m.emi, 0);
                    const yearPrincipal = months.reduce((acc, m) => acc + m.principalPayment, 0);
                    const yearInterest = months.reduce((acc, m) => acc + m.interestPayment, 0);
                    
                    return (
                      <Collapsible key={year} defaultOpen={year === 1}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ChevronRight className="w-4 h-4 transition-transform [[data-state=open]>&]:rotate-90" />
                                <div className="text-left">
                                  <p className="text-sm text-gray-900">Year {year}</p>
                                  <p className="text-xs text-gray-600">{months.length} months</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-right">
                                <div>
                                  <p className="text-xs text-gray-600">Total</p>
                                  <p className="text-sm text-gray-900">{formatShortCurrency(yearTotal)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-700">Principal</p>
                                  <p className="text-sm text-blue-900">{formatShortCurrency(yearPrincipal)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-orange-700">Interest</p>
                                  <p className="text-sm text-orange-900">{formatShortCurrency(yearInterest)}</p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <table className="w-full">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="p-2 text-left text-xs">Month</th>
                                  <th className="p-2 text-right text-xs">EMI</th>
                                  <th className="p-2 text-right text-xs">Principal</th>
                                  <th className="p-2 text-right text-xs">Interest</th>
                                  <th className="p-2 text-right text-xs">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {months.map((row, index) => (
                                  <tr 
                                    key={index} 
                                    className="border-b hover:bg-blue-50 transition-colors"
                                  >
                                    <td className="p-2 text-xs">{row.month}</td>
                                    <td className="p-2 text-right text-xs">{formatCurrency(row.emi)}</td>
                                    <td className="p-2 text-right text-xs text-blue-700">{formatCurrency(row.principalPayment)}</td>
                                    <td className="p-2 text-right text-xs text-orange-700">{formatCurrency(row.interestPayment)}</td>
                                    <td className="p-2 text-right text-xs">{formatCurrency(row.balance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Total Payments</p>
                    <p className="text-gray-900">{generateMonthlySchedule().length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total EMI</p>
                    <p className="text-gray-900">{formatShortCurrency(totalPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Principal</p>
                    <p className="text-blue-700">{formatShortCurrency(parseFloat(principal))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Interest</p>
                    <p className="text-orange-700">{formatShortCurrency(totalInterest)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

