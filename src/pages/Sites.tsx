
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronLeft,
  Edit,
  Plus,
  Search,
  Trash2,
  X,
  Building,
  MapPin,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/GlassCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockSites, SiteInfo } from "@/types/esg";

const Sites = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sites, setSites] = useState<SiteInfo[]>(mockSites);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null);
  const [newSite, setNewSite] = useState<Omit<SiteInfo, "id">>({
    name: "",
    location: "",
    type: ""
  });

  // Filter sites based on search query
  const filteredSites = sites.filter(site => {
    return (
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddSite = () => {
    const id = (Math.max(...sites.map(site => parseInt(site.id))) + 1).toString();
    const newSiteWithId: SiteInfo = {
      id,
      ...newSite
    };
    
    setSites([...sites, newSiteWithId]);
    setNewSite({ name: "", location: "", type: "" });
    setIsAddDialogOpen(false);
    toast.success(`Site "${newSite.name}" added successfully!`);
  };

  const handleDeleteSite = () => {
    if (selectedSite) {
      setSites(sites.filter(site => site.id !== selectedSite.id));
      setIsDeleteDialogOpen(false);
      toast.success(`Site "${selectedSite.name}" deleted successfully!`);
    }
  };

  const openDeleteDialog = (site: SiteInfo) => {
    setSelectedSite(site);
    setIsDeleteDialogOpen(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Site Management</h1>
          <p className="text-gray-500">Manage your production units, offices, and subsidiary locations</p>
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
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sites..."
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
          
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-esg-blue hover:bg-esg-blue/90 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Site
          </Button>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSites.length > 0 ? (
            filteredSites.map((site) => (
              <motion.div key={site.id} variants={item}>
                <GlassCard className="p-5 h-full relative group" hoverable>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <button
                        className="p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-50"
                        title="Edit Site"
                      >
                        <Edit size={14} className="text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-50"
                        title="Delete Site"
                        onClick={() => openDeleteDialog(site)}
                      >
                        <Trash2 size={14} className="text-esg-red" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-esg-blue/10 flex items-center justify-center text-esg-blue">
                      <Building size={20} />
                    </div>
                    <h3 className="font-medium text-lg">{site.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{site.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{site.type}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-xs text-gray-500">Last submission</span>
                        <p className="text-sm font-medium">April 15, 2023</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-esg-blue hover:text-esg-blue/90"
                        onClick={() => navigate("/form")}
                      >
                        Add Data
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-500">
              <Building size={40} className="mx-auto text-gray-300 mb-2" />
              <p>No sites found matching your search criteria.</p>
            </div>
          )}
        </motion.div>
      </GlassCard>

      {/* Add Site Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Site</DialogTitle>
            <DialogDescription>
              Enter the details of the new site to be added to your ESG data collection platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                placeholder="e.g., Unit-VI Hyderabad"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site-location">Location</Label>
              <Input
                id="site-location"
                placeholder="e.g., Hyderabad"
                value={newSite.location}
                onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site-type">Type</Label>
              <Input
                id="site-type"
                placeholder="e.g., Production, Office, R&D"
                value={newSite.type}
                onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSite}
              disabled={!newSite.name || !newSite.location || !newSite.type}
              className="bg-esg-blue hover:bg-esg-blue/90"
            >
              Add Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Site Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this site? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedSite && (
              <Alert className="bg-red-50 text-esg-red border-red-100">
                <AlertDescription>
                  You are about to delete <strong>{selectedSite.name}</strong> ({selectedSite.location}).
                  All associated ESG data will also be deleted.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSite}
            >
              Delete Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sites;
