import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { legacyApi } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function LoadTestResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('mixed');
  const [error, setError] = useState(null);

  const runTest = async (testScenario) => {
    setLoading(true);
    setError(null);
    try {
      const response = await legacyApi.functions.invoke('loadTestSimulation', {
        num_concurrent_users: testScenario === 'mixed' ? 500 : testScenario === 'trendingFetch' ? 2000 : 1000,
        num_requests_per_user: testScenario === 'mixed' ? 20 : testScenario === 'trendingFetch' ? 5 : 10,
        scenario: testScenario,
      });
      setResults(response.data);
      setScenario(testScenario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Load Test Simulator</h1>
          <p className="text-muted-foreground mb-8">Run comprehensive concurrent load tests to verify system efficiency under high traffic.</p>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => runTest('mixed')} disabled={loading} className="h-16 text-base">
              {loading ? 'Running...' : '500 Users (Mixed)'}
            </Button>
            <Button onClick={() => runTest('imageAnalysisBurst')} disabled={loading} className="h-16 text-base">
              {loading ? 'Running...' : '1000 Users (Image Analysis)'}
            </Button>
            <Button onClick={() => runTest('marketCompSearch')} disabled={loading} className="h-16 text-base">
              {loading ? 'Running...' : '800 Users (Market Comps)'}
            </Button>
            <Button onClick={() => runTest('trendingFetch')} disabled={loading} className="h-16 text-base">
              {loading ? 'Running...' : '2000 Users (Trending)'}
            </Button>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const testData = results.test_results;
  const functions = Object.keys(testData);
  const perfData = functions.map(func => ({
    name: func.replace('analyzeCardImage', 'Image').replace('fetchCardComps', 'Comps').replace('fetchTrending', 'Trending').replace('fetchBoxPrices', 'Box'),
    avg: testData[func].avg,
    p95: testData[func].p95,
    p99: testData[func].p99,
  }));

  const cacheData = [
    { name: 'Cache Hits', value: results.cache_effectiveness.cache_hits, fill: '#22c55e' },
    { name: 'Cache Misses', value: results.cache_effectiveness.total_requests - results.cache_effectiveness.cache_hits, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Load Test Results</h1>
            <p className="text-muted-foreground">Scenario: <span className="font-semibold">{scenario}</span></p>
          </div>
          <Button onClick={() => setResults(null)}>Run New Test</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Requests</div>
            <div className="text-3xl font-bold">{results.total_requests.toLocaleString()}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Throughput</div>
            <div className="text-3xl font-bold">{results.requests_per_second} req/s</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Cache Hit Rate</div>
            <div className="text-3xl font-bold">{results.cache_effectiveness.cache_hit_rate}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Error Rate</div>
            <div className={`text-3xl font-bold ${results.error_rate === '0.00%' ? 'text-green-500' : 'text-red-500'}`}>
              {results.error_rate}
            </div>
          </Card>
        </div>

        {/* Response Time Distribution */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Response Times (ms)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#3b82f6" name="Average" />
              <Bar dataKey="p95" fill="#f59e0b" name="P95" />
              <Bar dataKey="p99" fill="#ef4444" name="P99" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cache Effectiveness */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Cache Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={cacheData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} dataKey="value">
                  {cacheData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Performance Summary</h3>
            <div className="space-y-3">
              {functions.map(func => {
                const data = testData[func];
                const funcLabel = func.replace('analyzeCardImage', 'Image Analysis').replace('fetchCardComps', 'Market Comps').replace('fetchTrending', 'Trending').replace('fetchBoxPrices', 'Box Prices');
                return (
                  <div key={func} className="pb-3 border-b last:border-b-0">
                    <div className="font-semibold mb-1">{funcLabel}</div>
                    <div className="text-sm text-muted-foreground">Avg: {data.avg}ms | P95: {data.p95}ms | P99: {data.p99}ms | Count: {data.count}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Assessment */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">System Assessment</h3>
          <div className="space-y-3">
            {results.assessment.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                {item.includes('✅') ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={item.includes('✅') ? 'text-green-700' : 'text-amber-700'}>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        {results.recommendations.length > 0 && results.recommendations[0] !== 'No major optimizations needed. System performs well under load.' && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Optimization Recommendations
            </h3>
            <ul className="space-y-2">
              {results.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-900">• {rec}</li>
              ))}
            </ul>
          </Card>
        )}

        {results.recommendations[0] === 'No major optimizations needed. System performs well under load.' && (
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-xl font-bold text-green-900">✅ System Optimized</h3>
            <p className="text-green-800 mt-2">No major optimizations needed. System performs well under concurrent load.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

