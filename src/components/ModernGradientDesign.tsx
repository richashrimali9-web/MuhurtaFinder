import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Home, User, Car, Download, TrendingUp, DollarSign, Percent, Calendar, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ModernGradientDesign() {
  const [loanType, setLoanType] = useState('home');
  const [principal, setPrincipal] = useState('5000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState<'table' | 'graph'>('graph');

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

  const generateFullSchedule = () => {
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
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        totalPrincipal: parseFloat(principal) - balance,
        totalInterest: (emi * i) - (parseFloat(principal) - balance),
      });

      if (balance <= 0) break;
    }
    return schedule;
  };

  const generateYearlyData = () => {
    const fullSchedule = generateFullSchedule();
    const yearlyData = [];
    const years = Math.ceil(fullSchedule.length / 12);

    for (let year = 1; year <= years; year++) {
      const endMonth = Math.min(year * 12, fullSchedule.length);
      const monthData = fullSchedule[endMonth - 1];
      
      yearlyData.push({
        year: `Y${year}`,
        yearFull: `Year ${year}`,
        balance: monthData.balance,
        principalPaid: monthData.totalPrincipal,
        interestPaid: monthData.totalInterest,
      });
    }
    return yearlyData;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return formatCurrency(value);
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
    const fullSchedule = generateFullSchedule();
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
      {/* Header Card with Gradient */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-white">Unified Loan EMI Calculator</h2>
          </div>
          <p className="text-blue-100">Calculate your monthly EMI with precision and clarity</p>
        </div>

        {/* Loan Type Tabs */}
        <div className="p-6">
          <Tabs value={loanType} onValueChange={setLoanType} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="home" className="gap-2 py-3">
                <Home className="w-4 h-4" />
                Home Loan
              </TabsTrigger>
              <TabsTrigger value="personal" className="gap-2 py-3">
                <User className="w-4 h-4" />
                Personal Loan
              </TabsTrigger>
              <TabsTrigger value="car" className="gap-2 py-3">
                <Car className="w-4 h-4" />
                Car Loan
              </TabsTrigger>
            </TabsList>

            <TabsContent value={loanType} className="mt-6 space-y-6">
              {/* Input Fields with Sliders */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Principal Amount
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="h-12 border-2 focus:border-blue-500"
                      min={sliderRanges.principal.min}
                      max={sliderRanges.principal.max}
                    />
                  </div>
                  <Slider
                    value={[parseFloat(principal) || sliderRanges.principal.min]}
                    onValueChange={(values) => setPrincipal(values[0].toString())}
                    min={sliderRanges.principal.min}
                    max={sliderRanges.principal.max}
                    step={sliderRanges.principal.step}
                    className="mt-2"
                  />
                  {loanType === 'home' && (
                    <p className="text-xs text-gray-500">Typical home loan: ₹10L-₹5Cr</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-purple-600" />
                    Annual Interest Rate (%)
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="number"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="h-12 border-2 focus:border-purple-500"
                      min={sliderRanges.rate.min}
                      max={sliderRanges.rate.max}
                    />
                  </div>
                  <Slider
                    value={[parseFloat(rate) || sliderRanges.rate.min]}
                    onValueChange={(values) => setRate(values[0].toFixed(1))}
                    min={sliderRanges.rate.min}
                    max={sliderRanges.rate.max}
                    step={sliderRanges.rate.step}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500">Lower rates for secured loans</p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Tenure (Years)
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-500"
                      min={sliderRanges.tenure.min}
                      max={sliderRanges.tenure.max}
                    />
                  </div>
                  <Slider
                    value={[parseFloat(tenure) || sliderRanges.tenure.min]}
                    onValueChange={(values) => setTenure(values[0].toString())}
                    min={sliderRanges.tenure.min}
                    max={sliderRanges.tenure.max}
                    step={sliderRanges.tenure.step}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500">Longer tenor = lower EMI but more interest</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Results Section with Gradient Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-blue-900">Monthly EMI</h3>
            <Badge className="bg-blue-600">Primary</Badge>
          </div>
          <p className="text-blue-950 text-3xl">{formatCurrency(emi)}</p>
          <p className="text-blue-700 text-sm mt-2">Per month for {tenure} years</p>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-purple-900">Total Payment</h3>
            <Badge className="bg-purple-600">Summary</Badge>
          </div>
          <p className="text-purple-950 text-3xl">{formatCurrency(totalPayment)}</p>
          <p className="text-purple-700 text-sm mt-2">Principal + Interest</p>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-orange-900">Total Interest</h3>
            <Badge className="bg-orange-600">Cost</Badge>
          </div>
          <p className="text-orange-950 text-3xl">{formatCurrency(totalInterest)}</p>
          <p className="text-orange-700 text-sm mt-2">
            {((totalInterest / parseFloat(principal)) * 100).toFixed(1)}% of principal
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          className="flex-1 min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
          onClick={() => setShowSchedule(!showSchedule)}
        >
          <BarChart3 className="w-4 h-4" />
          {showSchedule ? 'Hide' : 'View'} Amortization Schedule
        </Button>
        <Button variant="outline" className="flex-1 min-w-[200px] h-12 gap-2">
          <Download className="w-4 h-4" />
          Download Schedule (PDF)
        </Button>
      </div>

      {/* Amortization Schedule with Tabs */}
      {showSchedule && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white">Amortization Schedule</h3>
                <p className="text-slate-300">Payment breakdown over time</p>
              </div>
              <div className="flex gap-2 bg-slate-700/50 p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={scheduleView === 'graph' ? 'secondary' : 'ghost'}
                  onClick={() => setScheduleView('graph')}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Graph
                </Button>
                <Button
                  size="sm"
                  variant={scheduleView === 'table' ? 'secondary' : 'ghost'}
                  onClick={() => setScheduleView('table')}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Table
                </Button>
              </div>
            </div>
          </div>

          {scheduleView === 'graph' ? (
            <div className="p-6 space-y-6">
              {/* Principal vs Interest Over Time */}
              <div>
                <h4 className="text-gray-900 mb-4">Payment Breakdown Over Years</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateYearlyData()}>
                    <defs>
                      <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatShortCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="principalPaid" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorPrincipal)"
                      name="Principal Paid"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interestPaid" 
                      stackId="1"
                      stroke="#f59e0b" 
                      fillOpacity={1} 
                      fill="url(#colorInterest)"
                      name="Interest Paid"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Outstanding Balance */}
              <div>
                <h4 className="text-gray-900 mb-4">Outstanding Loan Balance</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={generateYearlyData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatShortCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      name="Remaining Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Total Months</p>
                  <p className="text-gray-900 text-2xl">{parseFloat(tenure) * 12}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Total EMI Payments</p>
                  <p className="text-gray-900 text-2xl">{formatShortCurrency(totalPayment)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Interest Rate</p>
                  <p className="text-gray-900 text-2xl">{rate}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {Object.entries(generateYearlyScheduleGroups()).map(([yearStr, months]) => {
                    const year = parseInt(yearStr);
                    const yearTotal = months.reduce((acc, m) => acc + m.emi, 0);
                    const yearPrincipal = months.reduce((acc, m) => acc + m.principal, 0);
                    const yearInterest = months.reduce((acc, m) => acc + m.interest, 0);
                    const endBalance = months[months.length - 1].balance;
                    
                    return (
                      <Collapsible key={year} defaultOpen={year === 1}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ChevronRight className="w-5 h-5 transition-transform [[data-state=open]>&]:rotate-90" />
                                <div className="text-left">
                                  <h4 className="text-gray-900">Year {year}</h4>
                                  <p className="text-sm text-gray-600">{months.length} payments</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-6 text-right">
                                <div>
                                  <p className="text-xs text-gray-600">Total EMI</p>
                                  <p className="text-gray-900">{formatShortCurrency(yearTotal)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-700">Principal</p>
                                  <p className="text-blue-900">{formatShortCurrency(yearPrincipal)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-orange-700">Interest</p>
                                  <p className="text-orange-900">{formatShortCurrency(yearInterest)}</p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <table className="w-full">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="p-3 text-left text-sm">Month</th>
                                  <th className="p-3 text-right text-sm">EMI</th>
                                  <th className="p-3 text-right text-sm">Principal</th>
                                  <th className="p-3 text-right text-sm">Interest</th>
                                  <th className="p-3 text-right text-sm">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {months.map((row, index) => (
                                  <tr 
                                    key={index} 
                                    className="border-b hover:bg-slate-50 transition-colors"
                                  >
                                    <td className="p-3 text-sm">{row.month}</td>
                                    <td className="p-3 text-right text-sm">{formatCurrency(row.emi)}</td>
                                    <td className="p-3 text-right text-sm text-green-700">{formatCurrency(row.principal)}</td>
                                    <td className="p-3 text-right text-sm text-orange-700">{formatCurrency(row.interest)}</td>
                                    <td className="p-3 text-right text-sm">{formatCurrency(row.balance)}</td>
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
              <div className="p-4 bg-slate-50 border-t">
                <p className="text-center text-sm text-gray-600">
                  Showing all {generateFullSchedule().length} monthly payments grouped by year
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-500">
        Calculated EMI is for reference only. Please verify with your lender.
      </p>
    </div>
  );
}
