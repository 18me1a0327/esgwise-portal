
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useESGParameters, isESGStructureLoaded } from "@/hooks/useESGParameters";

import {
  CategoryType,
  Category,
  Parameter,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchParameters,
  fetchParametersByCategory,
  createParameter,
  updateParameter,
  deleteParameter,
} from "@/services/parameterService";

const ManageParameters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for active tab and selected items
  const [activeTab, setActiveTab] = useState<CategoryType>("environmental");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Get all ESG parameters in a structured format
  const { data: esgStructure, isLoading: isESGStructureLoading } = useESGParameters();
  const structureLoaded = isESGStructureLoaded(esgStructure);

  // Basic data queries
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Get parameters for the selected category
  const { data: parameters = [], isLoading: isParametersLoading } = useQuery({
    queryKey: ['parameters', selectedCategory],
    queryFn: () => selectedCategory 
      ? fetchParametersByCategory(selectedCategory) 
      : fetchParameters(),
    enabled: !!selectedCategory
  });

  // Dialog states for forms
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
  const [parameterName, setParameterName] = useState("");
  const [parameterUnit, setParameterUnit] = useState("");
  const [parameterCategoryId, setParameterCategoryId] = useState("");
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("environmental");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Mutations
  const categoryMutation = useMutation({
    mutationFn: (variables: { id?: string; name: string; type: CategoryType }) => {
      if (variables.id) {
        return updateCategory(variables.id, variables.name, variables.type);
      }
      return createCategory(variables.name, variables.type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: editingCategoryId ? "Category updated" : "Category created",
        description: `Category has been ${editingCategoryId ? "updated" : "created"} successfully.`,
      });
      resetCategoryForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save category",
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  });

  const parameterMutation = useMutation({
    mutationFn: (variables: { 
      id?: string; 
      name: string; 
      unit: string | null; 
      categoryId: string; 
    }) => {
      if (variables.id) {
        return updateParameter(
          variables.id, 
          variables.name, 
          variables.unit, 
          variables.categoryId
        );
      }
      return createParameter(
        variables.name, 
        variables.unit, 
        variables.categoryId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: editingParameterId ? "Parameter updated" : "Parameter created",
        description: `Parameter has been ${editingParameterId ? "updated" : "created"} successfully.`,
      });
      resetParameterForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save parameter",
        variant: "destructive",
      });
    }
  });

  const deleteParameterMutation = useMutation({
    mutationFn: deleteParameter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: "Parameter deleted",
        description: "Parameter has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete parameter",
        variant: "destructive",
      });
    }
  });

  // Form reset functions
  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryType("environmental");
    setIsCategoryDialogOpen(false);
  };

  const resetParameterForm = () => {
    setEditingParameterId(null);
    setParameterName("");
    setParameterUnit("");
    setParameterCategoryId("");
    setIsParameterDialogOpen(false);
  };

  // Edit functions
  const editCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setIsCategoryDialogOpen(true);
  };

  const editParameter = (parameter: Parameter) => {
    setEditingParameterId(parameter.id);
    setParameterName(parameter.name);
    setParameterUnit(parameter.unit || "");
    setParameterCategoryId(parameter.category_id);
    setIsParameterDialogOpen(true);
  };

  // Form submission functions
  const saveCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    categoryMutation.mutate({
      id: editingCategoryId || undefined,
      name: categoryName,
      type: categoryType,
    });
  };

  const saveParameter = () => {
    if (!parameterName.trim()) {
      toast({
        title: "Validation Error",
        description: "Parameter name is required",
        variant: "destructive",
      });
      return;
    }

    if (!parameterCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    parameterMutation.mutate({
      id: editingParameterId || undefined,
      name: parameterName,
      unit: parameterUnit || null,
      categoryId: parameterCategoryId,
    });
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));

    // If expanding, select this category
    if (!expandedCategories[categoryId]) {
      setSelectedCategory(categoryId);
    }
  };

  // Get categories by type
  const getCategoriesByType = (type: CategoryType) => {
    return categories.filter(c => c.type === type);
  };

  // Find category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Render the ESG structure view
  const renderESGStructure = () => {
    if (isESGStructureLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (!structureLoaded) {
      return (
        <div className="p-4 text-center border rounded-md">
          <p className="text-gray-500">No ESG parameters structure available.</p>
          <p className="text-sm text-gray-400 mt-2">
            Start by adding categories and parameters to build your ESG structure.
          </p>
        </div>
      );
    }

    // Get the categories for the active tab type
    const typeCategories = esgStructure?.[activeTab] || {};
    
    return (
      <div className="space-y-4">
        {Object.entries(typeCategories).length > 0 ? (
          Object.entries(typeCategories).map(([categoryName, { parameters }]) => (
            <Card key={categoryName} className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{categoryName}</span>
                  <Badge variant="outline" className="capitalize">
                    {activeTab}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {parameters.length > 0 ? (
                  <div className="divide-y">
                    {parameters.map(param => (
                      <div key={param.id} className="py-3 px-4 flex justify-between text-sm">
                        <span>{param.name}</span>
                        {param.unit && (
                          <Badge variant="outline" className="text-xs">
                            {param.unit}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-gray-500 text-sm">No parameters</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">
            No {activeTab} categories found
          </p>
        )}
      </div>
    );
  };

  // Render the management interface
  const renderManagementInterface = () => {
    const categoriesForActiveTab = getCategoriesByType(activeTab);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Categories</h3>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              setCategoryType(activeTab);
              setIsCategoryDialogOpen(true);
            }}>
              <Plus size={16} /> Add Category
            </Button>
          </div>

          <Card>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="p-4 space-y-2">
                {isCategoriesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : categoriesForActiveTab.length > 0 ? (
                  categoriesForActiveTab.map(category => (
                    <div key={category.id} className="border rounded-md overflow-hidden">
                      <div 
                        className="p-3 flex items-center justify-between hover:bg-muted/40 cursor-pointer"
                        onClick={() => toggleCategoryExpansion(category.id)}
                      >
                        <div className="flex items-center">
                          {expandedCategories[category.id] ? (
                            <ChevronDown size={18} className="mr-2 text-gray-500" />
                          ) : (
                            <ChevronRight size={18} className="mr-2 text-gray-500" />
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              editCategory(category);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategoryMutation.mutate(category.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Parameters directly under category */}
                      {expandedCategories[category.id] && (
                        <div className="bg-muted/20 border-t">
                          <div className="flex justify-between items-center px-3 py-2 border-b">
                            <span className="text-sm text-muted-foreground">Parameters</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                setParameterCategoryId(category.id);
                                setIsParameterDialogOpen(true);
                              }}
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          </div>

                          <div className="p-2">
                            {isParametersLoading && selectedCategory === category.id ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            ) : (
                              <>
                                {parameters
                                  .filter(param => param.category_id === category.id)
                                  .map(parameter => (
                                    <div 
                                      key={parameter.id} 
                                      className="p-2 flex items-center justify-between rounded-md hover:bg-muted/60 cursor-pointer text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{parameter.name}</span>
                                        {parameter.unit && (
                                          <Badge variant="outline" className="text-xs">
                                            {parameter.unit}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => editParameter(parameter)}
                                        >
                                          <Edit2 size={12} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => deleteParameterMutation.mutate(parameter.id)}
                                        >
                                          <Trash2 size={12} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                {parameters.filter(param => param.category_id === category.id).length === 0 && (
                                  <p className="text-center py-2 text-xs text-gray-500">
                                    No parameters found
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No {activeTab} categories found
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* ESG Structure Preview Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <h3 className="font-medium">ESG Structure Preview</h3>
          <Card className="p-4">
            {renderESGStructure()}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">ESG Parameter Management</h1>
          <p className="text-muted-foreground">
            Manage Environmental, Social, and Governance parameters for your ESG reporting
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['esg-parameters'] })}>
              <Loader2 size={16} className="mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="environmental" className="space-y-6 mt-6">
          {renderManagementInterface()}
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6 mt-6">
          {renderManagementInterface()}
        </TabsContent>
        
        <TabsContent value="governance" className="space-y-6 mt-6">
          {renderManagementInterface()}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategoryId 
                ? "Update the category details." 
                : "Fill the form to add a new category."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-type">Type</Label>
              <Select value={categoryType} onValueChange={(value: CategoryType) => setCategoryType(value)}>
                <SelectTrigger id="category-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetCategoryForm}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={categoryMutation.isPending}>
              {categoryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {editingCategoryId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parameter Dialog */}
      <Dialog open={isParameterDialogOpen} onOpenChange={setIsParameterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParameterId ? "Edit Parameter" : "Add New Parameter"}</DialogTitle>
            <DialogDescription>
              {editingParameterId 
                ? "Update the parameter details." 
                : "Fill the form to add a new parameter."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="parameter-name">Parameter Name</Label>
              <Input
                id="parameter-name"
                value={parameterName}
                onChange={(e) => setParameterName(e.target.value)}
                placeholder="Enter parameter name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parameter-unit">Unit (Optional)</Label>
              <Input
                id="parameter-unit"
                value={parameterUnit}
                onChange={(e) => setParameterUnit(e.target.value)}
                placeholder="e.g., kWh, kg, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parameter-category">Category</Label>
              <Select 
                value={parameterCategoryId} 
                onValueChange={setParameterCategoryId}
              >
                <SelectTrigger id="parameter-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Only show categories of the active tab type */}
                  {categories
                    .filter(c => c.type === activeTab)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetParameterForm}>
              Cancel
            </Button>
            <Button onClick={saveParameter} disabled={parameterMutation.isPending}>
              {parameterMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {editingParameterId ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageParameters;
