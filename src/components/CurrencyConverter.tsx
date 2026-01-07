import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useCurrencyRates, CURRENCIES } from '@/hooks/useCurrencyRates';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
  compact?: boolean;
  className?: string;
}

export function CurrencyConverter({
  defaultFrom = 'USD',
  defaultTo = 'EUR',
  defaultAmount = 100,
  compact = false,
  className,
}: CurrencyConverterProps) {
  const { convert, getRate, isLoading, lastUpdated, isOfflineRates, fetchRates, formatCurrency } =
    useCurrencyRates();

  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setConvertedAmount(convert(numAmount, fromCurrency, toCurrency));
  }, [amount, fromCurrency, toCurrency, convert]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const rate = getRate(fromCurrency, toCurrency);

  const currencyOptions = Object.entries(CURRENCIES).map(([code, info]) => ({
    value: code,
    label: `${code} - ${info.name}`,
    symbol: info.symbol,
  }));

  if (compact) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-right font-mono"
              placeholder="0.00"
            />
          </div>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-full"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-md px-3 py-2">
            <span className="font-mono text-lg font-semibold">
              {formatCurrency(convertedAmount, toCurrency)}
            </span>
          </div>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
          </span>
          {isOfflineRates && (
            <span className="text-orange-500">Offline rates</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Currency Converter
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRates()}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-right font-mono text-lg"
              placeholder="0.00"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{opt.value}</span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">
                        {opt.symbol}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="rounded-full h-10 w-10 border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted/50 rounded-md px-4 py-3 flex items-center justify-end">
              <span className="font-mono text-xl font-semibold">
                {formatCurrency(convertedAmount, toCurrency)}
              </span>
            </div>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{opt.value}</span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">
                        {opt.symbol}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Exchange Rate
            </span>
            <span className="font-medium">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated ? (
                <>Last updated: {format(lastUpdated, 'MMM d, h:mm a')}</>
              ) : (
                'Using cached rates'
              )}
            </span>
            {isOfflineRates && (
              <span className="text-orange-500 font-medium">Offline</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
