import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Home, User, Car, Sparkles, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';

export function GlassmorphismDesign() {
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

  const loanTypes = [
    { id: 'home', label: 'Home Loan', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'personal', label: 'Personal', icon: User, gradient: 'from-purple-500 to-pink-500' },
    { id: 'car', label: 'Car Loan', icon: Car, gradient: 'from-orange-500 to-red-500' },
  ];

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
      });

      if (balance <= 0) break;
    }
    return schedule;
  };

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
    <div className="relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Glass Header */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900">Premium EMI Calculator</h2>
              <p className="text-gray-600 text-sm">Modern glassmorphic design</p>
            </div>
          </div>

          {/* Loan Type Selection - Glass Pills */}
          <div className="flex gap-3 mt-6">
            {loanTypes.map((type) => {
              const Icon = type.icon;
              const isActive = loanType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setLoanType(type.id)}
                  className={`flex-1 p-4 rounded-2xl backdrop-blur-lg border transition-all ${
                    isActive
                      ? 'bg-white/80 border-white/80 shadow-lg scale-105'
                      : 'bg-white/30 border-white/40 hover:bg-white/50'
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${type.gradient} mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-900 text-sm">{type.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section - Glass Card */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-8">
            <h3 className="text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Loan Parameters
            </h3>

            <div className="space-y-6">
              <div>
                <Label className="text-gray-700 mb-2 block">Principal Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="h-12 backdrop-blur-sm bg-white/60 border-white/60 focus:bg-white/80 mb-2"
                    min={sliderRanges.principal.min}
                    max={sliderRanges.principal.max}
                  />
                  <span className="absolute right-4 top-6 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                </div>
                <Slider
                  value={[parseFloat(principal) || sliderRanges.principal.min]}
                  onValueChange={(values) => setPrincipal(values[0].toString())}
                  min={sliderRanges.principal.min}
                  max={sliderRanges.principal.max}
                  step={sliderRanges.principal.step}
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Interest Rate</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="h-12 backdrop-blur-sm bg-white/60 border-white/60 focus:bg-white/80 mb-2"
                    min={sliderRanges.rate.min}
                    max={sliderRanges.rate.max}
                  />
                  <span className="absolute right-4 top-6 -translate-y-1/2 text-gray-500 text-sm">% p.a.</span>
                </div>
                <Slider
                  value={[parseFloat(rate) || sliderRanges.rate.min]}
                  onValueChange={(values) => setRate(values[0].toFixed(1))}
                  min={sliderRanges.rate.min}
                  max={sliderRanges.rate.max}
                  step={sliderRanges.rate.step}
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Tenure</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="h-12 backdrop-blur-sm bg-white/60 border-white/60 focus:bg-white/80 mb-2"
                    min={sliderRanges.tenure.min}
                    max={sliderRanges.tenure.max}
                  />
                  <span className="absolute right-4 top-6 -translate-y-1/2 text-gray-500 text-sm">years</span>
                </div>
                <Slider
                  value={[parseFloat(tenure) || sliderRanges.tenure.min]}
                  onValueChange={(values) => setTenure(values[0].toString())}
                  min={sliderRanges.tenure.min}
                  max={sliderRanges.tenure.max}
                  step={sliderRanges.tenure.step}
                />
              </div>
            </div>

            <div className="mt-8 p-6 backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/40 rounded-2xl">
              <p className="text-gray-700 text-sm mb-1">Calculated EMI</p>
              <p className="text-gray-900 text-4xl mb-4">{formatCurrency(emi)}</p>
              <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalInterest / parseFloat(principal)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-2">Interest to Principal Ratio</p>
            </div>
          </div>

          {/* Results Section - Glass Cards */}
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-white/50 rounded-3xl shadow-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">Monthly Payment</p>
                  <p className="text-white text-3xl mt-1">{formatCurrency(emi)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-blue-100 text-sm">for {tenure} years ({parseFloat(tenure) * 12} months)</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-white/50 rounded-3xl shadow-2xl p-8">
              <p className="text-purple-100 text-sm mb-1">Total Amount Payable</p>
              <p className="text-white text-3xl mb-4">{formatCurrency(totalPayment)}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-sm bg-white/20 p-3 rounded-xl">
                  <p className="text-purple-100 text-xs">Principal</p>
                  <p className="text-white">{formatCurrency(parseFloat(principal))}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/20 p-3 rounded-xl">
                  <p className="text-purple-100 text-xs">Interest</p>
                  <p className="text-white">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-700 text-sm">Interest Component</p>
                  <p className="text-gray-900 text-2xl">{((totalInterest / parseFloat(principal)) * 100).toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700 text-sm">Total Interest</p>
                  <p className="text-orange-700 text-2xl">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 rounded-xl gap-2"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <BarChart3 className="w-4 h-4" />
                {showSchedule ? 'Hide' : 'View'} Detailed Breakdown
              </Button>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        {showSchedule && (
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl shadow-2xl p-8 mt-6">
            <div className="mb-6">
              <h3 className="text-gray-900">Amortization Schedule</h3>
              <p className="text-gray-600 text-sm">Year-by-year payment breakdown</p>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {Object.entries(generateYearlyScheduleGroups()).map(([yearStr, months]) => {
                  const year = parseInt(yearStr);
                  const yearTotal = months.reduce((acc, m) => acc + m.emi, 0);
                  const yearPrincipal = months.reduce((acc, m) => acc + m.principal, 0);
                  const yearInterest = months.reduce((acc, m) => acc + m.interest, 0);
                  
                  return (
                    <Collapsible key={year} defaultOpen={year === 1}>
                      <div className="backdrop-blur-lg bg-white/40 border border-white/50 rounded-2xl overflow-hidden">
                        <CollapsibleTrigger className="w-full bg-gradient-to-r from-blue-50/80 to-purple-50/80 hover:from-blue-100/80 hover:to-purple-100/80 transition-colors p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="w-5 h-5 transition-transform [[data-state=open]>&]:rotate-90 text-gray-700" />
                              <div className="text-left">
                                <p className="text-gray-900">Year {year}</p>
                                <p className="text-sm text-gray-600">{months.length} payments</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-right">
                              <div>
                                <p className="text-xs text-gray-600">Total</p>
                                <p className="text-gray-900">{formatShortCurrency(yearTotal)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-700">Principal</p>
                                <p className="text-blue-900">{formatShortCurrency(yearPrincipal)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-purple-700">Interest</p>
                                <p className="text-purple-900">{formatShortCurrency(yearInterest)}</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <table className="w-full">
                            <thead className="backdrop-blur-sm bg-white/60">
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
                                  className="border-b border-white/30 hover:bg-white/40 transition-colors"
                                >
                                  <td className="p-3 text-sm">{row.month}</td>
                                  <td className="p-3 text-right text-sm">{formatCurrency(row.emi)}</td>
                                  <td className="p-3 text-right text-sm text-blue-700">{formatCurrency(row.principal)}</td>
                                  <td className="p-3 text-right text-sm text-purple-700">{formatCurrency(row.interest)}</td>
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
          </div>
        )}

        {/* Footer Note */}
        <p className="text-center text-gray-600 text-xs mt-8 backdrop-blur-sm bg-white/30 p-4 rounded-2xl border border-white/40">
          💎 Premium calculator • All calculations are done locally in your browser
        </p>
      </div>
    </div>
  );
}
