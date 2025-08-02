import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranslatedText from "@/components/TranslatedText";
interface Program {
  id: string;
  name: string;
  description?: string;
  conditions?: string;
}
interface SubProject {
  id: string;
  name: string;
}
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  };
  programs: Program[];
  subProjects: SubProject[];
  isAdmin?: boolean;
  onEditCategory?: (category: any) => void;
  onDeleteCategory?: (categoryId: string) => void;
}
const CategoryCard = ({
  category,
  programs,
  subProjects,
  isAdmin = false,
  onEditCategory,
  onDeleteCategory
}: CategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Generate different vibrant colors for each card based on category ID
  const getCardColor = (categoryId: string) => {
    const colors = [
      "bg-blue-100 border-blue-300 hover:bg-blue-200", // Light blue
      "bg-green-100 border-green-300 hover:bg-green-200", // Light green
      "bg-purple-100 border-purple-300 hover:bg-purple-200", // Light purple
      "bg-orange-100 border-orange-300 hover:bg-orange-200", // Light orange
      "bg-pink-100 border-pink-300 hover:bg-pink-200", // Light pink
      "bg-teal-100 border-teal-300 hover:bg-teal-200", // Light teal
      "bg-indigo-100 border-indigo-300 hover:bg-indigo-200", // Light indigo
      "bg-yellow-100 border-yellow-300 hover:bg-yellow-200", // Light yellow
      "bg-red-100 border-red-300 hover:bg-red-200", // Light red
      "bg-cyan-100 border-cyan-300 hover:bg-cyan-200" // Light cyan
    ];
    
    // Use category ID to consistently assign colors
    const hash = categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const cardColor = getCardColor(category.id);
  const handleViewDetails = () => {
    navigate(`/category/${category.id}`);
  };
  return <Card className={`w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${cardColor}`}>
      <CardHeader className="pb-3 bg-card/60 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            {category.description && <CardDescription className="mt-1">{category.description}</CardDescription>}
          </div>
          {isAdmin && <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={() => onEditCategory?.(category)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDeleteCategory?.(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {programs.length} <TranslatedText id="card.programs" showMalayalam={false} />
            </Badge>
            <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent">
              {subProjects.length} <TranslatedText id="card.subProjects" showMalayalam={false} />
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && <CardContent className="pt-0">
          <div className="space-y-4">
            {programs.length > 0 && <div>
                <h4 className="font-medium text-sm mb-2">
                  <TranslatedText id="card.recentPrograms" showMalayalam={false} />
                </h4>
                <div className="space-y-2">
                  {programs.slice(0, 3).map(program => <div key={program.id} className="p-2 bg-muted rounded text-sm">
                      <div className="font-medium">{program.name}</div>
                      {program.description && <div className="text-muted-foreground text-xs mt-1">
                          {program.description.substring(0, 100)}...
                        </div>}
                    </div>)}
                </div>
              </div>}

            {subProjects.length > 0 && <div>
                <h4 className="font-medium text-sm mb-2">
                  <TranslatedText id="card.subProjects" showMalayalam={false} />:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {subProjects.slice(0, 5).map(subProject => <Badge key={subProject.id} variant="outline" className="text-xs">
                      {subProject.name}
                    </Badge>)}
                  {subProjects.length > 5 && <Badge variant="outline" className="text-xs">
                      +{subProjects.length - 5} more
                    </Badge>}
                </div>
              </div>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
                <TranslatedText id="card.viewDetails" showMalayalam={false} />
              </Button>
              {isAdmin && <>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/add-program?category=${category.id}`)}>
                    <Plus className="h-4 w-4 mr-1" />
                    <TranslatedText id="card.program" showMalayalam={false} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/add-sub-project?category=${category.id}`)}>
                    <Plus className="h-4 w-4 mr-1" />
                    <TranslatedText id="card.subProject" showMalayalam={false} />
                  </Button>
                </>}
            </div>
          </div>
        </CardContent>}
    </Card>;
};
export default CategoryCard;