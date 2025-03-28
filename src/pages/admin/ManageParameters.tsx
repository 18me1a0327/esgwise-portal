
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
  DialogTrigger,
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
  Subcategory,
  Parameter,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubcategories,
  fetchSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  fetchParameters,
  fetchParametersBySubcategory,
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Get all ESG parameters in a structured format
  const { data: esgStructure, isLoading: isESGStructureLoading } = useESGParameters();
  const structureLoaded = isESGStructureLoaded(esgStructure);

  // Basic data queries
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Get subcategories for the selected category
  const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: () => selectedCategory 
      ? fetchSubcategoriesByCategory(selectedCategory) 
      : fetchSubcategories(),
    enabled: !!selectedCategory
  });

  // Get parameters for the selected subcategory
  const { data: parameters = [], isLoading: isParametersLoading } = useQuery({
    queryKey: ['parameters', selectedSubcategory],
    queryFn: () => selectedSubcategory 
      ? fetchParametersBySubcategory(selectedSubcategory) 
      : fetchParameters(),
    enabled: !!selectedSubcategory
  });

  // Dialog states for forms
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
  const [parameterName, setParameterName] = useState("");
  const [parameterUnit, setParameterUnit] = useState("");
  const [parameterCategoryId, setParameterCategoryId] = useState("");
  const [parameterSubcategoryId, setParameterSubcategoryId] = useState("");
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("environmental");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);

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

  const subcategoryMutation = useMutation({
    mutationFn: (variables: { id?: string; name: string; categoryId: string }) => {
      if (variables.id) {
        return updateSubcategory(variables.id, variables.name, variables.categoryId);
      }
      return createSubcategory(variables.name, variables.categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: editingSubcategoryId ? "Subcategory updated" : "Subcategory created",
        description: `Subcategory has been ${editingSubcategoryId ? "updated" : "created"} successfully.`,
      });
      resetSubcategoryForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save subcategory",
        variant: "destructive",
      });
    }
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['esg-parameters'] });
      toast({
        title: "Subcategory deleted",
        description: "Subcategory has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subcategory",
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
      subcategoryId: string 
    }) => {
      if (variables.id) {
        return updateParameter(
          variables.id, 
          variables.name, 
          variables.unit, 
          variables.categoryId, 
          variables.subcategoryId
        );
      }
      return createParameter(
        variables.name, 
        variables.unit, 
        variables.categoryId, 
        variables.subcategoryId
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

  const resetSubcategoryForm = () => {
    setEditingSubcategoryId(null);
    setSubcategoryName("");
    setSubcategoryCategoryId("");
    setIsSubcategoryDialogOpen(false);
  };

  const resetParameterForm = () => {
    setEditingParameterId(null);
    setParameterName("");
    setParameterUnit("");
    setParameterCategoryId("");
    setParameterSubcategoryId("");
    setIsParameterDialogOpen(false);
  };

  // Edit functions
  const editCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryType(category.type);
    setIsCategoryDialogOpen(true);
  };

  const editSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryName(subcategory.name);
    setSubcategoryCategoryId(subcategory.category_id);
    setIsSubcategoryDialogOpen(true);
  };

  const editParameter = (parameter: Parameter) => {
    setEditingParameterId(parameter.id);
    setParameterName(parameter.name);
    setParameterUnit(parameter.unit || "");
    setParameterCategoryId(parameter.category_id);
    setParameterSubcategoryId(parameter.subcategory_id);
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

  const saveSubcategory = () => {
    if (!subcategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Subcategory name is required",
        variant: "destructive",
      });
      return;
    }

    if (!subcategoryCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    subcategoryMutation.mutate({
      id: editingSubcategoryId || undefined,
      name: subcategoryName,
      categoryId: subcategoryCategoryId,
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

    if (!parameterSubcategoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a subcategory",
        variant: "destructive",
      });
      return;
    }

    parameterMutation.mutate({
      id: editingParameterId || undefined,
      name: parameterName,
      unit: parameterUnit || null,
      categoryId: parameterCategoryId,
      subcategoryId: parameterSubcategoryId,
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

  // Find subcategory name by ID
  const getSubcategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : "Unknown";
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
            Start by adding categories, subcategories, and parameters to build your ESG structure.
          </p>
        </div>
      );
    }

    // Get the categories for the active tab type
    const typeCategories = esgStructure?.[activeTab] || {};
    
    return (
      <div className="space-y-4">
        {Object.entries(typeCategories).length > 0 ? (
          Object.entries(typeCategories).map(([categoryName, subcategories]) => (
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
                {Object.entries(subcategories).length > 0 ? (
                  <div className="divide-y">
                    {Object.entries(subcategories).map(([subcategoryName, { parameters }]) => (
                      <div key={subcategoryName} className="py-3 px-4">
                        <h4 className="font-medium text-sm mb-2">{subcategoryName}</h4>
                        <div className="pl-4 space-y-1">
                          {parameters.length > 0 ? (
                            parameters.map(param => (
                              <div key={param.id} className="flex justify-between text-sm">
                                <span>{param.name}</span>
                                {param.unit && (
                                  <Badge variant="outline" className="text-xs">
                                    {param.unit}
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No parameters</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-gray-500 text-sm">No subcategories</p>
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
        {/* Categories and Subcategories Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Categories & Subcategories</h3>
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

                      {/* Subcategories */}
                      {expandedCategories[category.id] && (
                        <div className="bg-muted/20 border-t">
                          <div className="flex justify-between items-center px-3 py-2 border-b">
                            <span className="text-sm text-muted-foreground">Subcategories</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                setSubcategoryCategoryId(category.id);
                                setIsSubcategoryDialogOpen(true);
                              }}
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          </div>

                          <div className="p-2">
                            {isSubcategoriesLoading && selectedCategory === category.id ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            ) : (
                              <>
                                {subcategories
                                  .filter(sub => sub.category_id === category.id)
                                  .map(subcategory => (
                                    <div 
                                      key={subcategory.id} 
                                      className={`
                                        p-2 flex items-center justify-between rounded-md
                                        ${selectedSubcategory === subcategory.id ? 'bg-primary/10' : 'hover:bg-muted/60'}
                                        cursor-pointer text-sm
                                      `}
                                      onClick={() => setSelectedSubcategory(subcategory.id)}
                                    >
                                      <span>{subcategory.name}</span>
                                      <div className="flex space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            editSubcategory(subcategory);
                                          }}
                                        >
                                          <Edit2 size={12} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSubcategoryMutation.mutate(subcategory.id);
                                          }}
                                        >
                                          <Trash2 size={12} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                {subcategories.filter(sub => sub.category_id === category.id).length === 0 && (
                                  <p className="text-center py-2 text-xs text-gray-500">
                                    No subcategories found
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

        {/* Parameters Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Parameters</h3>
            {selectedSubcategory && (
              <Button 
                size="sm" 
                onClick={() => {
                  const subcategory = subcategories.find(s => s.id === selectedSubcategory);
                  if (subcategory) {
                    setParameterSubcategoryId(subcategory.id);
                    setParameterCategoryId(subcategory.category_id);
                    setIsParameterDialogOpen(true);
                  }
                }}
              >
                <Plus size={16} className="mr-1" /> Add Parameter
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              {!selectedSubcategory ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a subcategory to manage its parameters</p>
                </div>
              ) : isParametersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-muted/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Selected:</p>
                    <p className="font-medium">
                      {getCategoryName(subcategories.find(s => s.id === selectedSubcategory)?.category_id || '')} 
                      {' '}/{' '}
                      {getSubcategoryName(selectedSubcategory)}
                    </p>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parameters.length > 0 ? (
                        parameters.map(parameter => (
                          <TableRow key={parameter.id}>
                            <TableCell className="font-medium">{parameter.name}</TableCell>
                            <TableCell>{parameter.unit || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => editParameter(parameter)}
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteParameterMutation.mutate(parameter.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                            No parameters found for this subcategory
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Handle category dialog subcategory list updates
  const handleCategoryChange = (categoryId: string) => {
    if (parameterCategoryId !== categoryId) {
      setParameterSubcategoryId("");
    }
    setParameterCategoryId(categoryId);
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

      {/* View Current Structure */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current ESG Structure</h2>
        </div>
        {renderESGStructure()}
      </div>

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

      {/* Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubcategoryId ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
            <DialogDescription>
              {editingSubcategoryId 
                ? "Update the subcategory details." 
                : "Fill the form to add a new subcategory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subcategory-name">Subcategory Name</Label>
              <Input
                id="subcategory-name"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                placeholder="Enter subcategory name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory-category">Category</Label>
              <Select value={subcategoryCategoryId} onValueChange={setSubcategoryCategoryId}>
                <SelectTrigger id="subcategory-category">
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
            <Button variant="outline" onClick={resetSubcategoryForm}>
              Cancel
            </Button>
            <Button onClick={saveSubcategory} disabled={subcategoryMutation.isPending}>
              {subcategoryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {editingSubcategoryId ? "Update" : "Save"}
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
                onValueChange={handleCategoryChange}
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
            <div className="grid gap-2">
              <Label htmlFor="parameter-subcategory">Subcategory</Label>
              <Select 
                value={parameterSubcategoryId} 
                onValueChange={setParameterSubcategoryId}
                disabled={!parameterCategoryId}
              >
                <SelectTrigger id="parameter-subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories
                    .filter(sub => sub.category_id === parameterCategoryId)
                    .map(subcategory => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
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
