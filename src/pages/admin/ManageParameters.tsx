
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
  Copy
} from "lucide-react";
import { motion } from "framer-motion";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  fetchCategories,
  fetchCategoriesByType,
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
  Category,
  Subcategory,
  Parameter,
  CategoryType,
} from "@/services/parameterService";

const ManageParameters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("parameters");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Parameter dialog states
  const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
  const [parameterName, setParameterName] = useState("");
  const [parameterUnit, setParameterUnit] = useState("");
  const [parameterCategoryId, setParameterCategoryId] = useState("");
  const [parameterSubcategoryId, setParameterSubcategoryId] = useState("");
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);

  // Category dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("environmental");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Subcategory dialog states
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);

  // Fetch data
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: () => selectedCategory 
      ? fetchSubcategoriesByCategory(selectedCategory) 
      : fetchSubcategories(),
    enabled: !!selectedCategory
  });

  const { data: parameters = [], isLoading: isParametersLoading } = useQuery({
    queryKey: ['parameters', selectedSubcategory],
    queryFn: () => selectedSubcategory 
      ? fetchParametersBySubcategory(selectedSubcategory) 
      : fetchParameters(),
    enabled: !!selectedSubcategory
  });

  // Category mutations
  const categoryMutation = useMutation({
    mutationFn: (variables: { id?: string; name: string; type: CategoryType }) => {
      if (variables.id) {
        return updateCategory(variables.id, variables.name, variables.type);
      }
      return createCategory(variables.name, variables.type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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

  // Subcategory mutations
  const subcategoryMutation = useMutation({
    mutationFn: (variables: { id?: string; name: string; categoryId: string }) => {
      if (variables.id) {
        return updateSubcategory(variables.id, variables.name, variables.categoryId);
      }
      return createSubcategory(variables.name, variables.categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
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

  // Parameter mutations
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

  // Reset form functions
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
    setCategoryType(category.type as CategoryType);
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

  // Save functions
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
  };

  // Render subcategories based on category
  const renderSubcategories = (categoryId: string) => {
    if (!expandedCategories[categoryId]) return null;

    const categorySubcategories = subcategories.filter(sub => sub.category_id === categoryId);

    return (
      <div className="ml-6 my-2 border-l border-gray-200 pl-4">
        {categorySubcategories.length > 0 ? (
          categorySubcategories.map(subcategory => (
            <div 
              key={subcategory.id} 
              className="py-2 flex items-center justify-between hover:bg-gray-50 rounded-md px-2"
              onClick={() => setSelectedSubcategory(subcategory.id)}
            >
              <span className="text-sm font-medium">{subcategory.name}</span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    editSubcategory(subcategory);
                  }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubcategoryMutation.mutate(subcategory.id);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-2 text-sm text-gray-500">No subcategories found</div>
        )}
      </div>
    );
  };

  // Render categories with subcategories
  const renderCategoriesWithSubcategories = () => {
    if (isCategoriesLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    const categoryTypeGroups: Record<CategoryType, Category[]> = {
      environmental: categories.filter(c => c.type === 'environmental'),
      social: categories.filter(c => c.type === 'social'),
      governance: categories.filter(c => c.type === 'governance')
    };

    return (
      <div className="space-y-6">
        {Object.entries(categoryTypeGroups).map(([type, cats]) => (
          <div key={type} className="space-y-2">
            <h3 className="font-medium text-lg capitalize">{type}</h3>
            <div className="border rounded-md">
              {cats.length > 0 ? (
                cats.map(category => (
                  <div key={category.id} className="border-b last:border-b-0">
                    <div 
                      className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        toggleCategoryExpansion(category.id);
                      }}
                    >
                      <div className="flex items-center">
                        {expandedCategories[category.id] ? (
                          <ChevronDown size={18} className="mr-2 text-gray-500" />
                        ) : (
                          <ChevronRight size={18} className="mr-2 text-gray-500" />
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            editCategory(category);
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    {renderSubcategories(category.id)}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No categories found for this type
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render parameters table based on selected subcategory
  const renderParametersTable = () => {
    if (!selectedSubcategory) {
      return (
        <div className="text-center py-8 text-gray-500">
          Please select a subcategory to view its parameters
        </div>
      );
    }

    if (isParametersLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    const selectedSubcategoryObj = subcategories.find(s => s.id === selectedSubcategory);
    const selectedCategoryObj = categories.find(c => c.id === selectedSubcategoryObj?.category_id);

    return (
      <div>
        {selectedCategoryObj && selectedSubcategoryObj && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="text-sm text-gray-500">Selected</div>
            <div className="font-medium">{selectedCategoryObj.name} / {selectedSubcategoryObj.name}</div>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
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
      </div>
    );
  };

  // Handle subcategory list updates when category changes
  const handleCategoryChange = (categoryId: string) => {
    if (parameterCategoryId !== categoryId) {
      setParameterSubcategoryId("");
    }
    setParameterCategoryId(categoryId);
  };

  return (
    <div className="container max-w-6xl mx-auto my-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Parameters</h1>
          <p className="text-gray-500">Add and manage ESG parameters, categories, and subcategories</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Parameter Management</h2>
            <Dialog open={isParameterDialogOpen} onOpenChange={setIsParameterDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Parameter
                </Button>
              </DialogTrigger>
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
                        {categories.map(category => (
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
                    ) : null}
                    {editingParameterId ? "Update Parameter" : "Add Parameter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-md p-4 space-y-4 md:col-span-1">
              <h3 className="font-medium">Categories & Subcategories</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {renderCategoriesWithSubcategories()}
              </div>
            </div>
            <div className="border rounded-md p-4 md:col-span-2">
              <h3 className="font-medium mb-4">Parameters</h3>
              {renderParametersTable()}
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Category Management</h2>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Category
                </Button>
              </DialogTrigger>
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
                    ) : null}
                    {editingCategoryId ? "Update Category" : "Add Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isCategoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : categories.length > 0 ? (
                  categories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="capitalize">{category.type}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editCategory(category)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
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
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Subcategories Tab */}
        <TabsContent value="subcategories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subcategory Management</h2>
            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Subcategory
                </Button>
              </DialogTrigger>
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
                        {categories.map(category => (
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
                    ) : null}
                    {editingSubcategoryId ? "Update Subcategory" : "Add Subcategory"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSubcategoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : subcategories.length > 0 ? (
                  subcategories.map(subcategory => {
                    const category = categories.find(c => c.id === subcategory.category_id);
                    return (
                      <TableRow key={subcategory.id}>
                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                        <TableCell>{category?.name || "Unknown Category"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editSubcategory(subcategory)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSubcategoryMutation.mutate(subcategory.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      No subcategories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageParameters;
