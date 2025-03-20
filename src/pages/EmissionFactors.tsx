
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Edit, Plus, Save, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  fetchEmissionFactors,
  updateEmissionFactor,
  createEmissionFactor,
  deleteEmissionFactor,
} from "@/services/emissionFactorService";

type EmissionFactor = {
  id: string;
  item: string;
  unit_of_measure: string;
  factor_2023: number;
  factor_2024: number;
  factor_2025: number;
  category: string;
};

const EmissionFactors = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);
  const [newFactor, setNewFactor] = useState<Partial<EmissionFactor>>({
    item: "",
    unit_of_measure: "",
    factor_2023: 0,
    factor_2024: 0,
    factor_2025: 0,
    category: "energy",
  });

  // Fetch emission factors
  const { data: emissionFactors = [], isLoading } = useQuery({
    queryKey: ["emissionFactors"],
    queryFn: fetchEmissionFactors,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (factor: EmissionFactor) => {
      return updateEmissionFactor(factor.id, factor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emissionFactors"] });
      toast.success("Emission factor updated successfully!");
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (factor: Partial<EmissionFactor>) => {
      return createEmissionFactor(factor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emissionFactors"] });
      toast.success("Emission factor created successfully!");
      setCreateDialogOpen(false);
      setNewFactor({
        item: "",
        unit_of_measure: "",
        factor_2023: 0,
        factor_2024: 0,
        factor_2025: 0,
        category: "energy",
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteEmissionFactor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emissionFactors"] });
      toast.success("Emission factor deleted successfully!");
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    },
  });

  const handleEdit = (factor: EmissionFactor) => {
    setSelectedFactor(factor);
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedFactor) {
      updateMutation.mutate(selectedFactor);
    }
  };

  const handleCreate = () => {
    createMutation.mutate(newFactor);
  };

  const handleDelete = () => {
    if (selectedFactor) {
      deleteMutation.mutate(selectedFactor.id);
    }
  };

  const handleOpenDeleteDialog = (factor: EmissionFactor) => {
    setSelectedFactor(factor);
    setDeleteDialogOpen(true);
  };

  const categoryOptions = [
    { value: "energy", label: "Energy" },
    { value: "refrigerant", label: "Refrigerant" },
    { value: "other", label: "Other" },
  ];

  // Group factors by category
  const groupedFactors = emissionFactors.reduce((groups: Record<string, EmissionFactor[]>, factor) => {
    const category = factor.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(factor);
    return groups;
  }, {});

  return (
    <div className="container max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emission Factors</h1>
          <p className="text-gray-500">Manage emission factors used for calculations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-1 bg-esg-blue hover:bg-esg-blue/90"
          >
            <Plus size={16} />
            Add Factor
          </Button>
        </div>
      </div>

      <GlassCard className="p-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 size={36} className="animate-spin mb-4" />
            <p>Loading emission factors...</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedFactors).map(([category, factors]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-medium capitalize mb-4">{category} Factors</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">2023 Factor</TableHead>
                        <TableHead className="text-right">2024 Factor</TableHead>
                        <TableHead className="text-right">2025 Factor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factors.map((factor) => (
                        <TableRow key={factor.id}>
                          <TableCell className="font-medium">{factor.item}</TableCell>
                          <TableCell>{factor.unit_of_measure}</TableCell>
                          <TableCell className="text-right">{factor.factor_2023}</TableCell>
                          <TableCell className="text-right">{factor.factor_2024}</TableCell>
                          <TableCell className="text-right">{factor.factor_2025}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(factor)}
                                className="flex items-center gap-1"
                              >
                                <Edit size={14} />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDeleteDialog(factor)}
                                className="flex items-center gap-1 text-esg-red hover:text-esg-red border-esg-red/20 hover:border-esg-red/30 hover:bg-esg-red/10"
                              >
                                <Trash2 size={14} />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </>
        )}
      </GlassCard>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Emission Factor</DialogTitle>
            <DialogDescription>
              Update the details for this emission factor.
            </DialogDescription>
          </DialogHeader>

          {selectedFactor && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item" className="text-right">
                  Item
                </Label>
                <Input
                  id="item"
                  value={selectedFactor.item}
                  onChange={(e) =>
                    setSelectedFactor({ ...selectedFactor, item: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="unit"
                  value={selectedFactor.unit_of_measure}
                  onChange={(e) =>
                    setSelectedFactor({ ...selectedFactor, unit_of_measure: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={selectedFactor.category}
                  onValueChange={(value) =>
                    setSelectedFactor({ ...selectedFactor, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="factor2023" className="text-right">
                  2023 Factor
                </Label>
                <Input
                  id="factor2023"
                  type="number"
                  step="0.000001"
                  value={selectedFactor.factor_2023}
                  onChange={(e) =>
                    setSelectedFactor({
                      ...selectedFactor,
                      factor_2023: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="factor2024" className="text-right">
                  2024 Factor
                </Label>
                <Input
                  id="factor2024"
                  type="number"
                  step="0.000001"
                  value={selectedFactor.factor_2024}
                  onChange={(e) =>
                    setSelectedFactor({
                      ...selectedFactor,
                      factor_2024: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="factor2025" className="text-right">
                  2025 Factor
                </Label>
                <Input
                  id="factor2025"
                  type="number"
                  step="0.000001"
                  value={selectedFactor.factor_2025}
                  onChange={(e) =>
                    setSelectedFactor({
                      ...selectedFactor,
                      factor_2025: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updateMutation.isPending}
              className="bg-esg-blue hover:bg-esg-blue/90"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Emission Factor</DialogTitle>
            <DialogDescription>
              Enter the details for the new emission factor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newItem" className="text-right">
                Item
              </Label>
              <Input
                id="newItem"
                value={newFactor.item}
                onChange={(e) => setNewFactor({ ...newFactor, item: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newUnit" className="text-right">
                Unit
              </Label>
              <Input
                id="newUnit"
                value={newFactor.unit_of_measure}
                onChange={(e) =>
                  setNewFactor({ ...newFactor, unit_of_measure: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCategory" className="text-right">
                Category
              </Label>
              <Select
                value={newFactor.category}
                onValueChange={(value) => setNewFactor({ ...newFactor, category: value })}
              >
                <SelectTrigger id="newCategory" className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newFactor2023" className="text-right">
                2023 Factor
              </Label>
              <Input
                id="newFactor2023"
                type="number"
                step="0.000001"
                value={newFactor.factor_2023 || ''}
                onChange={(e) =>
                  setNewFactor({
                    ...newFactor,
                    factor_2023: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newFactor2024" className="text-right">
                2024 Factor
              </Label>
              <Input
                id="newFactor2024"
                type="number"
                step="0.000001"
                value={newFactor.factor_2024 || ''}
                onChange={(e) =>
                  setNewFactor({
                    ...newFactor,
                    factor_2024: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newFactor2025" className="text-right">
                2025 Factor
              </Label>
              <Input
                id="newFactor2025"
                type="number"
                step="0.000001"
                value={newFactor.factor_2025 || ''}
                onChange={(e) =>
                  setNewFactor({
                    ...newFactor,
                    factor_2025: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={createMutation.isPending || !newFactor.item || !newFactor.unit_of_measure}
              className="bg-esg-blue hover:bg-esg-blue/90"
            >
              {createMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Add Factor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this emission factor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Delete Factor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmissionFactors;
