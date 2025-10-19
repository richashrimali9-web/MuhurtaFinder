import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Home, User, Car, ArrowRight, ChevronRight, BarChart3 } from 'lucide-react';

export function MinimalCleanDesign() {
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
    if (value >= 10000000) return `â‚¹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `â‚¹${(value / 100000).toFixed(1)}L`;
    return formatCurrency(value);
  };

  const loanTypes = [
    { id: 'home', label: 'Home Loan', icon: Home },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'car', label: 'Car Loan', icon: Car },
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
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm border border-gray-200">
        <div className="p-8 md:p-12">
          {/* Minimal Header */}
          <div className="mb-10">
            <h2 className="text-gray-900 mb-1">EMI Calculator</h2>
            <p className="text-gray-600">Simple and precise loan calculation</p>
          </div>

          {/* Clean Loan Type Selection */}
          <div className="mb-8">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
              {loanTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setLoanType(type.id)}
                    className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                      loanType === type.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Fields with Sliders - Clean Layout */}
          <div className="space-y-8 mb-10">
            <div>
              <Label className="text-gray-700 mb-3 block">Principal Amount</Label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="h-14 text-lg border-gray-300 focus:border-gray-900 mb-3"
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
              <Label className="text-gray-700 mb-3 block">Annual Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="h-14 text-lg border-gray-300 focus:border-gray-900 mb-3"
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
              <Label className="text-gray-700 mb-3 block">Tenure (Years)</Label>
              <Input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="h-14 text-lg border-gray-300 focus:border-gray-900 mb-3"
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

          <Separator className="my-10" />

          {/* Results - Minimal Style */}
          <div className="space-y-6 mb-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-600 mb-1">Monthly EMI</p>
                <p className="text-gray-900 text-4xl">{formatCurrency(emi)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 mb-3" />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <p className="text-gray-600 mb-1 text-sm">Total Payment</p>
                <p className="text-gray-900 text-xl">{formatCurrency(totalPayment)}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1 text-sm">Total Interest</p>
                <p className="text-gray-900 text-xl">{formatCurrency(totalInterest)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 gap-2"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <BarChart3 className="w-4 h-4" />
              {showSchedule ? 'Hide' : 'View'} Full Schedule
            </Button>
            <Button variant="outline" className="flex-1 h-12 border-gray-300">
              Download PDF
            </Button>
          </div>

          {/* Minimal Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            This calculator does not collect or store personal data
          </p>
        </div>
      </Card>

      {/* Amortization Schedule */}
      {showSchedule && (
        <Card className="mt-6 shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-gray-900">Amortization Schedule</h3>
            <p className="text-gray-600 text-sm">Year-by-year payment breakdown</p>
          </div>
          <div className="p-6">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {Object.entries(generateYearlyScheduleGroups()).map(([yearStr, months]) => {
                  const year = parseInt(yearStr);
                  const yearTotal = months.reduce((acc, m) => acc + m.emi, 0);
                  const yearPrincipal = months.reduce((acc, m) => acc + m.principal, 0);
                  const yearInterest = months.reduce((acc, m) => acc + m.interest, 0);
                  
                  return (
                    <Collapsible key={year} defaultOpen={year === 1}>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="w-full bg-gray-50 hover:bg-gray-100 transition-colors p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="w-5 h-5 transition-transform [[data-state=open]>&]:rotate-90" />
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
                                <p className="text-xs text-gray-600">Principal</p>
                                <p className="text-gray-900">{formatShortCurrency(yearPrincipal)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Interest</p>
                                <p className="text-gray-900">{formatShortCurrency(yearInterest)}</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <table className="w-full">
                            <thead className="bg-gray-50 border-t border-gray-200">
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
                                  className="border-b hover:bg-gray-50 transition-colors"
                                >
                                  <td className="p-3 text-sm">{row.month}</td>
                                  <td className="p-3 text-right text-sm">{formatCurrency(row.emi)}</td>
                                  <td className="p-3 text-right text-sm text-gray-700">{formatCurrency(row.principal)}</td>
                                  <td className="p-3 text-right text-sm text-gray-700">{formatCurrency(row.interest)}</td>
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
        </Card>
      )}
    </div>
  );
}

