
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Coins, Server, User, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { McpStackRecord, formatStackStatus, getStackStatusColor } from '@/types/mcp';

const MCPStackingRecords = () => {
  const [records, setRecords] = useState<McpStackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Mock data for demonstration - replace with actual API call
  const mockRecords: McpStackRecord[] = [
    {
      principal_id: "rdmx6-jaaaa-aaaah-qcaiq-cai",
      mcp_name: "mcp_voice",
      stack_time: BigInt(Date.now() - 86400000),
      stack_amount: BigInt(100),
      stack_status: { Active: null }
    },
    {
      principal_id: "rrkah-fqaaa-aaaah-qcaiq-cai",
      mcp_name: "mcp_translator",
      stack_time: BigInt(Date.now() - 172800000),
      stack_amount: BigInt(250),
      stack_status: { Completed: null }
    },
    {
      principal_id: "rdmx6-jaaaa-aaaah-qcaiq-cai",
      mcp_name: "mcp_analyzer",
      stack_time: BigInt(Date.now() - 259200000),
      stack_amount: BigInt(50),
      stack_status: { Pending: null }
    }
  ];

  useEffect(() => {
    fetchStackingRecords();
  }, [currentPage]);

  const fetchStackingRecords = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to fetch stacking records
      // const result = await getStackingRecords(currentPage, itemsPerPage);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRecords = mockRecords.slice(startIndex, endIndex);
      
      setRecords(paginatedRecords);
      setTotalRecords(mockRecords.length);
      setTotalPages(Math.ceil(mockRecords.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching stacking records:', error);
      toast({
        title: "Error",
        description: "Failed to load stacking records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp)).toLocaleDateString('en-US', {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            onClick={fetchStackingRecords}
            disabled={loading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
                {records.filter(r => 'Active' in r.stack_status).length}
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
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
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
                            {formatDate(record.stack_time)}
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
      </div>
    </div>
  );
};

export default MCPStackingRecords;
