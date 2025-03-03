'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format } from 'date-fns';

interface CacheStatsProps {
  getStats: () => any;
  refreshCache: () => Promise<void>;
}

/**
 * Component for displaying cache statistics and controls
 */
export default function CacheStats({ getStats, refreshCache }: CacheStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update stats every 5 seconds
  useEffect(() => {
    updateStats();
    
    const interval = setInterval(() => {
      updateStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    try {
      const currentStats = getStats();
      setStats(currentStats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error getting cache stats:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshCache();
      updateStats();
    } catch (err) {
      console.error('Error refreshing cache:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-100">User Cache Statistics</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Cache
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-gray-400">Cache Size</div>
            <div className="text-gray-100 font-medium">{stats.size} users</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">Workspaces</div>
            <div className="text-gray-100 font-medium">{stats.workspaces}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">TTL</div>
            <div className="text-gray-100 font-medium">{Math.round(stats.ttlMs / 60000)} minutes</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">Last Updated</div>
            <div className="text-gray-100 font-medium">
              {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : 'Never'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 