
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Coins, Server, User, TrendingUp, RefreshCw, Activity, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { McpStackRecord, formatStackStatus, getStackStatusColor } from '@/types/mcp';
import { getStackRecordsPaginated, getTracesByAgentNamePaginated } from '@/services/can/mcpOperations';
import { TraceLog } from '@/services/can/traceOperations';

const MCPStackingRecords = () => {
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState<McpStackRecord[]>([]);
  const [traceLogs, setTraceLogs] = useState<TraceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [traceLoading, setTraceLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTracePage, setCurrentTracePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTracePages, setTotalTracePages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedMcp, setSelectedMcp] = useState<string>('');
  const itemsPerPage = 10;
  const traceItemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    const mcpName = searchParams.get('mcp');
    if (mcpName) {
      setSelectedMcp(mcpName);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedMcp) {
      fetchStackingRecords();
    }
  }, [currentPage, selectedMcp]);

  useEffect(() => {
    if (selectedMcp) {
      fetchTraceLogs();
    }
  }, [currentTracePage, selectedMcp]);

  const fetchStackingRecords = async () => {
    if (!selectedMcp) {
      toast({
        title: "Error",
        description: "Please select an MCP first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const offset = BigInt((currentPage - 1) * itemsPerPage);
      const limit = BigInt(itemsPerPage);
      
      console.log(`Fetching stacking records for MCP ${selectedMcp} - offset: ${offset}, limit: ${limit}`);
      
      const result = await getStackRecordsPaginated(selectedMcp, offset, limit);

      // Adapt the records here
      const adaptedRecords = result.map((record: any) => ({
        ...record,
        stack_time: Number(record.stack_time) / 1_000_000, // convert to ms
        stack_status: adaptStackStatus(record.stack_status), // adapt status
      }));

      setRecords(adaptedRecords);
      setTotalRecords(adaptedRecords.length);
      
      // Calculate total pages based on whether we got a full page
      if (adaptedRecords.length < itemsPerPage) {
        setTotalPages(currentPage);
      } else {
        setTotalPages(currentPage + 1);
      }
      
      console.log(`Fetched ${adaptedRecords.length} stacking records for MCP ${selectedMcp}`);
    } catch (error) {
      console.error('Error fetching stacking records:', error);
      toast({
        title: "Error",
        description: "Failed to load stacking records. Please try again.",
        variant: "destructive",
      });
      setRecords([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraceLogs = async () => {
    if (!selectedMcp) return;

    setTraceLoading(true);
    try {
      const offset = BigInt((currentTracePage - 1) * traceItemsPerPage);
      const limit = BigInt(traceItemsPerPage);
      
      console.log(`Fetching trace logs for agent ${selectedMcp} - offset: ${offset}, limit: ${limit}`);
      
      const result = await getTracesByAgentNamePaginated(selectedMcp, offset, limit);
      setTraceLogs(result);
      
      // Calculate total pages based on whether we got a full page
      if (result.length < traceItemsPerPage) {
        setTotalTracePages(currentTracePage);
      } else {
        setTotalTracePages(currentTracePage + 1);
      }
      
      console.log(`Fetched ${result.length} trace logs for agent ${selectedMcp}`);
    } catch (error) {
      console.error('Error fetching trace logs:', error);
      toast({
        title: "Error",
        description: "Failed to load trace logs. Please try again.",
        variant: "destructive",
      });
      setTraceLogs([]);
      setTotalTracePages(1);
    } finally {
      setTraceLoading(false);
    }
  };

  // Helper to adapt stack_status
  function adaptStackStatus(status: any) {
    if (status && typeof status === 'object') {
      if ('Active' in status) return { Active: true };
      if ('Stacked' in status) return { Stacked: true };
      // Add more cases as needed
    }
    return { Unknown: true };
  }

  const formatDate = (timestampMs: number): string => {
    if (!timestampMs || isNaN(timestampMs)) return 'Invalid Date';
    return new Date(timestampMs).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: bigint): string => {
    return Number(amount).toLocaleString();
  };

  const truncatePrincipalId = (principalId: string): string => {
    if (principalId.length <= 10) return principalId;
    return `${principalId.slice(0, 6)}...${principalId.slice(-4)}`;
  };

  const truncateTraceId = (traceId: string): string => {
    if (traceId.length <= 20) return traceId;
    return `${traceId.slice(0, 10)}...${traceId.slice(-6)}`;
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTracePageChange = (page: number) => {
    setCurrentTracePage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link to="/home/mcp-store" className="flex items-center gap-2">
                <ArrowLeft size={20} />
                Back to MCP Store
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="text-emerald-400" />
                MCP Stacking Records
              </h1>
              <p className="text-slate-300 mt-1">View all MCP server staking activities</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              fetchStackingRecords();
              fetchTraceLogs();
            }}
            disabled={loading || traceLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw size={16} className={loading || traceLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                <Coins size={16} />
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalRecords}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-100 text-sm font-medium flex items-center gap-2">
                <Server size={16} />
                Active Stacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {records.filter(r => 'Stacked' in r.stack_status).length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-100 text-sm font-medium flex items-center gap-2">
                <TrendingUp size={16} />
                Total Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatAmount(records.reduce((sum, record) => sum + record.stack_amount, BigInt(0)))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar size={20} />
              Stacking History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin text-white" size={32} />
                <span className="ml-3 text-white">Loading records...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 text-lg">No stacking records found</p>
                <p className="text-slate-400">Start stacking to see your records here</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-200">Principal ID</TableHead>
                        <TableHead className="text-slate-200">MCP Server</TableHead>
                        <TableHead className="text-slate-200">Stack Time</TableHead>
                        <TableHead className="text-slate-200">Amount</TableHead>
                        <TableHead className="text-slate-200">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record, index) => (
                        <TableRow key={index} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-slate-400" />
                              <code className="text-sm bg-slate-800/50 px-2 py-1 rounded">
                                {truncatePrincipalId(record.principal_id)}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <Server size={16} className="text-slate-400" />
                              <span className="font-medium">{record.mcp_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {formatDate(Number(record.stack_time))}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <Coins size={16} className="text-emerald-400" />
                              <span className="font-medium">{formatAmount(record.stack_amount)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${getStackStatusColor(record.stack_status)} border rounded-full px-3 py-1`}
                            >
                              {formatStackStatus(record.stack_status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink 
                              isActive={currentPage === index + 1}
                              onClick={() => handlePageChange(index + 1)}
                              className={`cursor-pointer text-white border-white/20 hover:bg-white/10 ${
                                currentPage === index + 1 ? 'bg-white/20' : ''
                              }`}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Trace Logs Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity size={20} />
              Trace Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {traceLoading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin text-white" size={32} />
                <span className="ml-3 text-white">Loading trace logs...</span>
              </div>
            ) : traceLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-300 text-lg">No trace logs found</p>
                <p className="text-slate-400">Trace logs will appear here when MCP calls are made</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-slate-200">Trace ID</TableHead>
                        <TableHead className="text-slate-200">Protocol</TableHead>
                        <TableHead className="text-slate-200">Agent/MCP Name</TableHead>
                        <TableHead className="text-slate-200">Method</TableHead>
                        <TableHead className="text-slate-200">Status</TableHead>
                        <TableHead className="text-slate-200">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {traceLogs.map((traceLog, traceIndex) => 
                        traceLog.calls.map((call, callIndex) => (
                          <TableRow key={`${traceIndex}-${callIndex}`} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="text-slate-300">
                              <code className="text-sm bg-slate-800/50 px-2 py-1 rounded">
                                {truncateTraceId(traceLog.trace_id)}
                              </code>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <Badge variant="outline" className="bg-blue-500/20 border-blue-400/60 text-blue-300">
                                {call.protocol}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <Server size={16} className="text-slate-400" />
                                <span className="font-medium">{call.agent}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <code className="text-sm bg-slate-800/50 px-2 py-1 rounded">
                                {call.method}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`${getStatusBadgeColor(call.status)} border rounded-full px-3 py-1`}
                              >
                                {call.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <span className="text-sm">
                                  {new Date().toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Trace Logs Pagination */}
                {totalTracePages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentTracePage > 1 && handleTracePageChange(currentTracePage - 1)}
                            className={`${currentTracePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalTracePages }).map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink 
                              isActive={currentTracePage === index + 1}
                              onClick={() => handleTracePageChange(index + 1)}
                              className={`cursor-pointer text-white border-white/20 hover:bg-white/10 ${
                                currentTracePage === index + 1 ? 'bg-white/20' : ''
                              }`}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentTracePage < totalTracePages && handleTracePageChange(currentTracePage + 1)}
                            className={`${currentTracePage === totalTracePages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white/10'} text-white border-white/20`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MCPStackingRecords;
