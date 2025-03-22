import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronUp, 
  Clock, 
  Eye, 
  Filter, 
  Search, 
  ThumbsDown, 
  ThumbsUp, 
  X,
  Loader2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { fetchSubmissions, updateSubmissionStatus, fetchSubmissionDetails } from "@/services/esgSubmissionService";
import { ApprovalStatus } from "@/types/esg";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Submission = {
  id: string;
  site_id: string;
  status: ApprovalStatus;
  submitted_by: string;
  submitted_at: string;
  updated_at: string;
  site: {
    id: string;
    name: string;
  };
};

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "updated_at",
    direction: "desc"
  });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState("environmental");

  const { 
    data: submissionDetails, 
    isLoading: isDetailsLoading 
  } = useQuery({
    queryKey: ['submission-details', selectedSubmission?.id],
    queryFn: () => selectedSubmission ? fetchSubmissionDetails(selectedSubmission.id) : null,
    enabled: !!selectedSubmission && viewDialogOpen
  });

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: ApprovalStatus; comment?: string }) => {
      return updateSubmissionStatus(id, status, "Admin User", comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setRejectionDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  });

  const filteredData = useMemo(() => {
    return submissions.filter((submission: Submission) => {
      const matchesSearch = searchQuery === "" || 
        submission.site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.submitted_by.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || submission.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, filterStatus]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      return 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleApprove = (submission: Submission) => {
    statusMutation.mutate({ 
      id: submission.id, 
      status: 'approved' 
    });
    
    toast.success(`Submission for ${submission.site.name} has been approved.`);
  };

  const handleReject = () => {
    if (selectedSubmission) {
      statusMutation.mutate({ 
        id: selectedSubmission.id, 
        status: 'rejected', 
        comment: rejectionReason 
      });
      
      toast.success(`Submission for ${selectedSubmission.site.name} has been rejected.`);
    }
  };

  const handleOpenRejectDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setRejectionDialogOpen(true);
  };

  const handleOpenViewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const formatValue = (value: any, unit: string = "") => {
    if (value === null || value === undefined) return "-";
    return `${typeof value === 'number' ? value.toLocaleString() : value}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div className="container max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Approval Queue</h1>
          <p className="text-gray-500">Review and approve ESG data submissions</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Back
        </Button>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by site or submitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Filter size={16} />
              Filter
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10 border"
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      filterStatus === "all" ? "bg-esg-blue/10 text-esg-blue" : "hover:bg-gray-100"
                    }`}
                  >
                    All Submissions
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("pending");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      filterStatus === "pending" ? "bg-esg-blue/10 text-esg-blue" : "hover:bg-gray-100"
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("approved");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      filterStatus === "approved" ? "bg-esg-blue/10 text-esg-blue" : "hover:bg-gray-100"
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("rejected");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      filterStatus === "rejected" ? "bg-esg-blue/10 text-esg-blue" : "hover:bg-gray-100"
                    }`}
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("draft");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      filterStatus === "draft" ? "bg-esg-blue/10 text-esg-blue" : "hover:bg-gray-100"
                    }`}
                  >
                    Drafts
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {isLoadingSubmissions ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 size={36} className="animate-spin mb-4" />
            <p>Loading submissions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("site.name")}
                  >
                    <div className="flex items-center gap-1">
                      Site
                      {sortConfig.key === "site.name" && (
                        sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("updated_at")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortConfig.key === "updated_at" && (
                        sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((submission: Submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <StatusBadge status={submission.status} />
                      </TableCell>
                      <TableCell>{submission.site.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.submitted_by}</p>
                          <p className="text-sm text-gray-500">Reporter</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span>{formatDate(submission.updated_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleOpenViewDialog(submission)}
                          >
                            <Eye size={14} />
                            View
                          </Button>
                          
                          {submission.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-esg-red hover:text-esg-red border-esg-red/20 hover:border-esg-red/30 hover:bg-esg-red/10"
                                onClick={() => handleOpenRejectDialog(submission)}
                                disabled={statusMutation.isPending}
                              >
                                {statusMutation.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ThumbsDown size={14} />
                                )}
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="flex items-center gap-1 bg-esg-green hover:bg-esg-green/90"
                                onClick={() => handleApprove(submission)}
                                disabled={statusMutation.isPending}
                              >
                                {statusMutation.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ThumbsUp size={14} />
                                )}
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No submissions found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Site</p>
                      <p className="font-medium">{selectedSubmission.site.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted By</p>
                      <p className="font-medium">{selectedSubmission.submitted_by}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted Date</p>
                      <p className="font-medium">{formatDate(selectedSubmission.submitted_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <StatusBadge status={selectedSubmission.status} />
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {isDetailsLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 size={30} className="animate-spin text-gray-400" />
            </div>
          ) : submissionDetails ? (
            <div className="py-4">
              <Tabs defaultValue="environmental" value={activeViewTab} onValueChange={setActiveViewTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="environmental">Environmental</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="governance">Governance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="environmental" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Energy Consumption</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Total Electricity</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.total_electricity, "kWh")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Renewable Energy (PPA)</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.renewable_ppa, "kWh")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Renewable Energy (Rooftop)</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.renewable_rooftop, "kWh")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Coal Consumption</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.coal_consumption, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">HSD Consumption</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.hsd_consumption, "KL")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Furnace Oil Consumption</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.furnace_oil_consumption, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Petrol Consumption</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.petrol_consumption, "KL")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Emissions</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Total Emissions</p>
                          <p className="font-medium text-red-600">{formatValue(submissionDetails.environmentalData.total_emissions, "tCO2e")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Electricity Emissions</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.electricity_emissions, "tCO2e")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Coal Emissions</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.coal_emissions, "tCO2e")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">HSD Emissions</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.hsd_emissions, "tCO2e")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Furnace Oil Emissions</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.furnace_oil_emissions, "tCO2e")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Petrol Emissions</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.petrol_emissions, "tCO2e")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Air Emissions</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">NOx</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.nox, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">SOx</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.sox, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PM</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.pm, "MT")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Water Management</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Water Withdrawal</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.water_withdrawal, "KL")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Third-Party Water</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.third_party_water, "KL")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rainwater Harvesting</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.rainwater, "KL")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Waste Management</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Total Waste</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.total_waste, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hazardous Waste</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.total_hazardous, "MT")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Non-Hazardous Waste</p>
                          <p className="font-medium">{formatValue(submissionDetails.environmentalData.non_hazardous, "MT")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Employment & Workforce</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Total Employees</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.total_employees)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Male Employees</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.male_employees)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Female Employees</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.female_employees)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">New Hires</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.new_hires)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Attrition</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.attrition)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Employee Benefits</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Health Insurance</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.health_insurance, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Accident Insurance</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.accident_insurance, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parental Benefits</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.parental_benefits, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PF Coverage</p>
                          <p className="font-medium">{formatValue(submissionDetails.socialData.pf_coverage, "%")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="governance" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Board Composition</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Board Members</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.board_members)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Women on Board</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.women_percentage, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members Under 30</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.board_under30, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members 30-50</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.board_30to50, "%")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members Above 50</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.board_above50, "%")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Business Ethics & Cybersecurity</h3>
                      <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Cybersecurity Incidents</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.cybersecurity_incidents)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Corruption Incidents</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.corruption_incidents)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Legal Fines</p>
                          <p className="font-medium">{formatValue(submissionDetails.governanceData.legal_fines)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No detailed data available
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="mr-auto"
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/form/${selectedSubmission?.id}`)}
              className="flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Open Full Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this submission. This will be shared with the submitter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setRejectionDialogOpen(false)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || statusMutation.isPending}
            >
              {statusMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalQueue;
