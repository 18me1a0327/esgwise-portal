
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Check, 
  X, 
  Eye, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  getSubmissionsForApproval, 
  approveSubmission, 
  rejectSubmission, 
  getSubmissionById 
} from '@/services/esgSubmissionService';
import { ESGSubmission } from '@/types/esg';
import { toast } from 'sonner';

const ApprovalQueue = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<ESGSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    energy: false,
    emissions: false,
    water: false,
    waste: false,
    workforce: false,
    safety: false,
    training: false,
    benefits: false,
    governance: false,
    compliance: false,
    experience: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const { data: submissions = [], refetch } = useQuery({
    queryKey: ['approval-submissions'],
    queryFn: getSubmissionsForApproval
  });

  const handleView = async (id: string) => {
    try {
      const submission = await getSubmissionById(id);
      setSelectedSubmission(submission);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load submission details');
      console.error(error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSubmission(id);
      toast.success('Submission approved successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to approve submission');
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSubmission(id);
      toast.success('Submission rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject submission');
      console.error(error);
    }
  };

  // Type guard for the ESG data
  const hasFieldData = (submission: ESGSubmission, field: string): boolean => {
    if (!submission || !submission.data) return false;
    return typeof submission.data === 'object' && submission.data !== null && field in submission.data;
  };

  // Helper to safely get field value
  const getFieldValue = (submission: ESGSubmission, field: string): any => {
    if (!hasFieldData(submission, field)) return null;
    return (submission.data as Record<string, any>)[field];
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Approval Queue</h1>
        <p className="text-gray-600">Review and approve ESG data submissions</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.filter(sub => sub.status === 'pending').map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.id.slice(0, 8)}</TableCell>
                    <TableCell>{submission.siteName}</TableCell>
                    <TableCell>{submission.period}</TableCell>
                    <TableCell>{submission.submittedBy}</TableCell>
                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleView(submission.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-green-600"
                          onClick={() => handleApprove(submission.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleReject(submission.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.filter(sub => sub.status === 'pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No pending submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="approved">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.filter(sub => sub.status === 'approved').map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.id.slice(0, 8)}</TableCell>
                    <TableCell>{submission.siteName}</TableCell>
                    <TableCell>{submission.period}</TableCell>
                    <TableCell>{submission.submittedBy}</TableCell>
                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell>
                      {submission.approvedAt && new Date(submission.approvedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleView(submission.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.filter(sub => sub.status === 'approved').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No approved submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="rejected">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rejected On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.filter(sub => sub.status === 'rejected').map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.id.slice(0, 8)}</TableCell>
                    <TableCell>{submission.siteName}</TableCell>
                    <TableCell>{submission.period}</TableCell>
                    <TableCell>{submission.submittedBy}</TableCell>
                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell>
                      {submission.rejectedAt && new Date(submission.rejectedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleView(submission.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.filter(sub => sub.status === 'rejected').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No rejected submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Submission ID</p>
                  <p className="font-medium">{selectedSubmission.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Site</p>
                  <p className="font-medium">{selectedSubmission.siteName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium">{selectedSubmission.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedSubmission.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium">{selectedSubmission.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {new Date(selectedSubmission.submittedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {/* Environmental Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Environmental Data</h3>
                
                {/* Energy Consumption */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('energy')}
                  >
                    <h4 className="font-medium">Energy Consumption</h4>
                    {expandedSections.energy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.energy && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Electricity (kWh)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'total_electricity') ? getFieldValue(selectedSubmission, 'total_electricity') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Renewable Energy - PPA (kWh)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'renewable_ppa') ? getFieldValue(selectedSubmission, 'renewable_ppa') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Renewable Energy - Rooftop (kWh)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'renewable_rooftop') ? getFieldValue(selectedSubmission, 'renewable_rooftop') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Coal Consumption (tonnes)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'coal_consumption') ? getFieldValue(selectedSubmission, 'coal_consumption') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">HSD Consumption (liters)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'hsd_consumption') ? getFieldValue(selectedSubmission, 'hsd_consumption') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Emissions */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('emissions')}
                  >
                    <h4 className="font-medium">Emissions</h4>
                    {expandedSections.emissions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.emissions && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">NOx (mg/Nm³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'nox') ? getFieldValue(selectedSubmission, 'nox') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">SOx (mg/Nm³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'sox') ? getFieldValue(selectedSubmission, 'sox') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Particulate Matter (mg/Nm³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'pm') ? getFieldValue(selectedSubmission, 'pm') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total GHG Emissions (tCO₂e)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'total_emissions') ? getFieldValue(selectedSubmission, 'total_emissions') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Water Management */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('water')}
                  >
                    <h4 className="font-medium">Water Management</h4>
                    {expandedSections.water ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.water && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Water Withdrawal (m³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'water_withdrawal') ? getFieldValue(selectedSubmission, 'water_withdrawal') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Third-party Water (m³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'third_party_water') ? getFieldValue(selectedSubmission, 'third_party_water') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rainwater Harvested (m³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'rainwater') ? getFieldValue(selectedSubmission, 'rainwater') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Water Discharged (m³)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'water_discharged') ? getFieldValue(selectedSubmission, 'water_discharged') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Waste Management */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('waste')}
                  >
                    <h4 className="font-medium">Waste Management</h4>
                    {expandedSections.waste ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.waste && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Hazardous Waste (tonnes)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'total_hazardous') ? getFieldValue(selectedSubmission, 'total_hazardous') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Non-hazardous Waste (tonnes)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'non_hazardous') ? getFieldValue(selectedSubmission, 'non_hazardous') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Plastic Waste (tonnes)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'plastic_waste') ? getFieldValue(selectedSubmission, 'plastic_waste') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">E-waste (tonnes)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'e_waste') ? getFieldValue(selectedSubmission, 'e_waste') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Data</h3>
                
                {/* Workforce Diversity */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('workforce')}
                  >
                    <h4 className="font-medium">Workforce Diversity</h4>
                    {expandedSections.workforce ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.workforce && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Employees</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'total_employees') ? getFieldValue(selectedSubmission, 'total_employees') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Male Employees (Permanent)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'male_employees') ? getFieldValue(selectedSubmission, 'male_employees') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Female Employees (Permanent)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'female_employees') ? getFieldValue(selectedSubmission, 'female_employees') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Male Employees (Contract)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'contract_male') ? getFieldValue(selectedSubmission, 'contract_male') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Female Employees (Contract)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'contract_female') ? getFieldValue(selectedSubmission, 'contract_female') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Health & Safety */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('safety')}
                  >
                    <h4 className="font-medium">Health & Safety</h4>
                    {expandedSections.safety ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.safety && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Lost Time Injuries (Employees)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'injuries_employees') ? getFieldValue(selectedSubmission, 'injuries_employees') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lost Time Injuries (Contract Workers)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'injuries_workers') ? getFieldValue(selectedSubmission, 'injuries_workers') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fatalities (Employees)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'fatalities_employees') ? getFieldValue(selectedSubmission, 'fatalities_employees') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fatalities (Contract Workers)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'fatalities_workers') ? getFieldValue(selectedSubmission, 'fatalities_workers') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Training & Development */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('training')}
                  >
                    <h4 className="font-medium">Training & Development</h4>
                    {expandedSections.training ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.training && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">EHS Training (hours)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'ehs_training') ? getFieldValue(selectedSubmission, 'ehs_training') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Professional Training (hours)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'gmp_training') ? getFieldValue(selectedSubmission, 'gmp_training') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Other Training (hours)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'other_training') ? getFieldValue(selectedSubmission, 'other_training') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Employee Benefits */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('benefits')}
                  >
                    <h4 className="font-medium">Employee Benefits</h4>
                    {expandedSections.benefits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.benefits && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">PF Coverage (%)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'pf_coverage') ? getFieldValue(selectedSubmission, 'pf_coverage') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ESI Coverage (%)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'esi_coverage') ? getFieldValue(selectedSubmission, 'esi_coverage') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Health Insurance (%)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'health_insurance') ? getFieldValue(selectedSubmission, 'health_insurance') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parental Benefits (%)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'parental_benefits') ? getFieldValue(selectedSubmission, 'parental_benefits') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Governance Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Governance Data</h3>
                
                {/* Board Composition */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('governance')}
                  >
                    <h4 className="font-medium">Board Composition</h4>
                    {expandedSections.governance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.governance && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Board Members</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'board_members') ? getFieldValue(selectedSubmission, 'board_members') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Women on Board (%)</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'women_percentage') ? getFieldValue(selectedSubmission, 'women_percentage') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members Under 30</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'board_under30') ? getFieldValue(selectedSubmission, 'board_under30') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members 30-50</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'board_30to50') ? getFieldValue(selectedSubmission, 'board_30to50') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Board Members Above 50</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'board_above50') ? getFieldValue(selectedSubmission, 'board_above50') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Compliance & Ethics */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('compliance')}
                  >
                    <h4 className="font-medium">Compliance & Ethics</h4>
                    {expandedSections.compliance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.compliance && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Legal/Regulatory Fines</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'legal_fines') ? getFieldValue(selectedSubmission, 'legal_fines') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Corruption Incidents</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'corruption_incidents') ? getFieldValue(selectedSubmission, 'corruption_incidents') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cybersecurity Incidents</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'cybersecurity_incidents') ? getFieldValue(selectedSubmission, 'cybersecurity_incidents') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Board Experience */}
                <div className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleSection('experience')}
                  >
                    <h4 className="font-medium">Board Experience</h4>
                    {expandedSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  
                  {expandedSections.experience && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Under 5 Years Experience</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'exp_under5') ? getFieldValue(selectedSubmission, 'exp_under5') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">5-10 Years Experience</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'exp_5to10') ? getFieldValue(selectedSubmission, 'exp_5to10') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Above 10 Years Experience</p>
                          <p className="font-medium">
                            {hasFieldData(selectedSubmission, 'exp_above10') ? getFieldValue(selectedSubmission, 'exp_above10') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedSubmission.status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedSubmission.id);
                        setViewDialogOpen(false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        handleApprove(selectedSubmission.id);
                        setViewDialogOpen(false);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalQueue;
