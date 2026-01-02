import { useMemo } from 'react';
import { Itinerary } from '@/types/itinerary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { startOfDay } from 'date-fns';
import { ExpenseCharts } from './ExpenseCharts';
interface ExpenseSummaryProps {
  itinerary: Itinerary;
}

interface ExpenseBreakdown {
  activities: number;
  accommodations: number;
  transportation: number;
  total: number;
}

export function ExpenseSummary({ itinerary }: ExpenseSummaryProps) {
  const today = startOfDay(new Date());
  const tripStart = startOfDay(new Date(itinerary.startDate));
  const tripEnd = startOfDay(new Date(itinerary.endDate));
  const isOngoingTrip = today >= tripStart && today <= tripEnd;
  const isUpcoming = today < tripStart;

  const expenses = useMemo((): ExpenseBreakdown => {
    const activities = itinerary.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
    const accommodations = itinerary.accommodations.reduce((sum, a) => sum + (a.cost || 0), 0);
    const transportation = itinerary.transportation.reduce((sum, t) => sum + (t.cost || 0), 0);
    return {
      activities,
      accommodations,
      transportation,
      total: activities + accommodations + transportation,
    };
  }, [itinerary]);

  const budget = itinerary.budget || 0;
  const remaining = budget - expenses.total;
  const spentPercentage = budget > 0 ? Math.min((expenses.total / budget) * 100, 100) : 0;
  const isOverBudget = remaining < 0;

  // Get traveler count for split calculation
  const getTravelerCount = () => {
    const adults = itinerary.adultsCount || (itinerary.tripType === 'solo' ? 1 : itinerary.tripType === 'couple' ? 2 : 1);
    const children = itinerary.childrenCount || 0;
    return adults + children;
  };

  const travelerCount = getTravelerCount();
  const perPersonExpense = travelerCount > 1 ? expenses.total / travelerCount : expenses.total;
  const isGroupTrip = itinerary.tripType === 'group' || itinerary.tripType === 'family';

  const currency = itinerary.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Expenses
          </CardTitle>
          {isOngoingTrip && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              Ongoing Trip
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Spent */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Spent</span>
          <span className="text-2xl font-bold">{formatCurrency(expenses.total)}</span>
        </div>

        {/* Budget Progress (only if budget is set) */}
        {budget > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">{formatCurrency(budget)}</span>
            </div>
            <Progress 
              value={spentPercentage} 
              className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={`flex items-center gap-1 ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isOverBudget ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Over budget
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    Remaining
                  </>
                )}
              </span>
              <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining))}
              </span>
            </div>
            
            {/* Budget status for ongoing trips */}
            {isOngoingTrip && (
              <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-sm ${
                isOverBudget 
                  ? 'bg-destructive/10 text-destructive' 
                  : spentPercentage > 80 
                    ? 'bg-yellow-500/10 text-yellow-600' 
                    : 'bg-green-500/10 text-green-600'
              }`}>
                {isOverBudget ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
                  </>
                ) : spentPercentage > 80 ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    You've used {spentPercentage.toFixed(0)}% of your budget
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {formatCurrency(remaining)} available for the rest of your trip
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expense Breakdown */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-medium text-muted-foreground">Breakdown</h4>
          <div className="grid gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activities</span>
              <span>{formatCurrency(expenses.activities)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accommodations</span>
              <span>{formatCurrency(expenses.accommodations)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transportation</span>
              <span>{formatCurrency(expenses.transportation)}</span>
            </div>
          </div>
        </div>

        {/* Split Expenses (for group/family trips) */}
        {isGroupTrip && travelerCount > 1 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Split Equally ({travelerCount} travelers)</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Per person</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(perPersonExpense)}</span>
              </div>
              {budget > 0 && (
                <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                  <span>Budget per person</span>
                  <span>{formatCurrency(budget / travelerCount)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expense Charts */}
        <div className="pt-3 border-t">
          <ExpenseCharts itinerary={itinerary} />
        </div>
      </CardContent>
    </Card>
  );
}
