
import React, { useState } from "react";
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
  X 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockESGData, mockSites, ApprovalStatus, ESGFormData } from "@/types/esg";

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "updatedAt",
    direction: "desc"
  });
  const [selectedSubmission, setSelectedSubmission] = useState<ESGFormData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);

  // Filter data based on search query and filter status
  const filteredData = mockESGData.filter(submission => {
    const matchesSearch = searchQuery === "" || 
      mockSites.find(site => site.id === submission.siteId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || submission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof ESGFormData];
    const bValue = b[sortConfig.key as keyof ESGFormData];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      if (sortConfig.direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }
    
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleApprove = (submission: ESGFormData) => {
    toast.success(`Submission for ${mockSites.find(site => site.id === submission.siteId)?.name} has been approved.`);
  };

  const handleReject = () => {
    if (selectedSubmission) {
      toast.success(`Submission for ${mockSites.find(site => site.id === selectedSubmission.siteId)?.name} has been rejected.`);
      setRejectionDialogOpen(false);
      setRejectionReason("");
    }
  };

  const handleOpenRejectDialog = (submission: ESGFormData) => {
    setSelectedSubmission(submission);
    setRejectionDialogOpen(true);
  };

  const getSiteName = (siteId: string) => {
    return mockSites.find(site => site.id === siteId)?.name || "Unknown Site";
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
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th
                  className="text-left py-3 px-4 font-medium cursor-pointer"
                  onClick={() => requestSort("siteId")}
                >
                  <div className="flex items-center gap-1">
                    Site
                    {sortConfig.key === "siteId" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">Submitted By</th>
                <th
                  className="text-left py-3 px-4 font-medium cursor-pointer"
                  onClick={() => requestSort("updatedAt")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === "updatedAt" && (
                      sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="py-4 px-4">{getSiteName(submission.siteId)}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{submission.submittedBy.name}</p>
                        <p className="text-sm text-gray-500">{submission.submittedBy.department}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>{formatDate(submission.updatedAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => navigate(`/form/${submission.id}`)}
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
                            >
                              <ThumbsDown size={14} />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-esg-green hover:bg-esg-green/90"
                              onClick={() => handleApprove(submission)}
                            >
                              <ThumbsUp size={14} />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalQueue;
