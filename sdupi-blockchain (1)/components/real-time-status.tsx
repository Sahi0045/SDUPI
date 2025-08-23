/**
 * 🚀 SDUPI Real-time Status Component
 * Shows connection status and data flow between frontend and backend
 */

"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Activity, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import useSDUPIBlockchain from '@/hooks/useSDUPIBlockchain';
import { SDUPI_CONFIG } from '@/lib/sdupi-blockchain';

export const RealTimeStatus: React.FC = () => {
  const { realTimeData, networkStats } = useSDUPIBlockchain();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Update timestamp when data changes
  useEffect(() => {
    if (realTimeData) {
      setLastUpdate(new Date());
      setConnectionStatus('connected');
    }
  }, [realTimeData]);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeData) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeData]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'connecting':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to SDUPI Blockchain';
      case 'connecting':
        return 'Connecting to SDUPI Blockchain...';
      case 'disconnected':
        return 'Disconnected from SDUPI Blockchain';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time Data Status
        </CardTitle>
        <CardDescription>
          Live connection status and data flow from SDUPI backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">Backend Connection</p>
              <p className="text-sm text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Badge>
        </div>

        {/* Data Flow Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Data Source</p>
            <p className="text-lg font-medium">
              {realTimeData ? 'Backend API' : 'Simulated'}
            </p>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Update Frequency</p>
            <p className="text-lg font-medium">Real-time</p>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Last Update</p>
            <p className="text-lg font-medium">
              {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Data Indicators */}
        {realTimeData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Network Data</span>
              <Badge variant="outline" className="text-green-600">
                ✓ Available
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blockchain Data</span>
              <Badge variant="outline" className="text-green-600">
                ✓ Available
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">DeFi Data</span>
              <Badge variant="outline" className="text-green-600">
                ✓ Available
              </Badge>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {networkStats && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-medium mb-2">Live Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">TPS:</span>
                <span className="ml-2 font-medium">{networkStats.tps.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Latency:</span>
                <span className="ml-2 font-medium">{networkStats.latency.toFixed(2)}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nodes:</span>
                <span className="ml-2 font-medium">{networkStats.nodes.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Health:</span>
                <span className="ml-2 font-medium text-green-600">{networkStats.networkHealth.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Backend API: {SDUPI_CONFIG.API_BASE_URL}</p>
          <p>• WebSocket: {SDUPI_CONFIG.WEBSOCKET_URL}</p>
          <p>• Data Refresh: Every 5 seconds</p>
          <p>• Fallback: Simulated data when backend unavailable</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeStatus;
