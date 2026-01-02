import { useMemo } from 'react';
import { Itinerary, getItineraryDates } from '@/types/itinerary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ExpenseChartsProps {
  itinerary: Itinerary;
}

const CATEGORY_COLORS = {
  activities: 'hsl(var(--chart-1))',
  accommodations: 'hsl(var(--chart-2))',
  transportation: 'hsl(var(--chart-3))',
};

export function ExpenseCharts({ itinerary }: ExpenseChartsProps) {
  const currency = itinerary.currency || 'USD';

  const categoryData = useMemo(() => {
    const activities = itinerary.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
    const accommodations = itinerary.accommodations.reduce((sum, a) => sum + (a.cost || 0), 0);
    const transportation = itinerary.transportation.reduce((sum, t) => sum + (t.cost || 0), 0);

    return [
      { name: 'Activities', value: activities, color: CATEGORY_COLORS.activities },
      { name: 'Accommodations', value: accommodations, color: CATEGORY_COLORS.accommodations },
      { name: 'Transportation', value: transportation, color: CATEGORY_COLORS.transportation },
    ].filter(item => item.value > 0);
  }, [itinerary]);

  const dailyData = useMemo(() => {
    const dates = getItineraryDates(itinerary.startDate, itinerary.endDate);
    
    return dates.map(date => {
      const activities = itinerary.activities
        .filter(a => a.date === date)
        .reduce((sum, a) => sum + (a.cost || 0), 0);
      
      const accommodations = itinerary.accommodations
        .filter(a => a.checkIn === date)
        .reduce((sum, a) => sum + (a.cost || 0), 0);
      
      const transportation = itinerary.transportation
        .filter(t => t.departureDate === date)
        .reduce((sum, t) => sum + (t.cost || 0), 0);

      return {
        date,
        label: format(parseISO(date), 'MMM d'),
        activities,
        accommodations,
        transportation,
        total: activities + accommodations + transportation,
      };
    }).filter(day => day.total > 0);
  }, [itinerary]);

  const hasData = categoryData.length > 0;

  if (!hasData) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Category Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" />
            By Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Bar Chart */}
      {dailyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              By Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value > 0 ? `${value}` : ''}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar 
                    dataKey="activities" 
                    stackId="a" 
                    fill={CATEGORY_COLORS.activities}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="accommodations" 
                    stackId="a" 
                    fill={CATEGORY_COLORS.accommodations}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="transportation" 
                    stackId="a" 
                    fill={CATEGORY_COLORS.transportation}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
